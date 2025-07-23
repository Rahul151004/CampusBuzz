require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcrypt');
const saltrounds = 12;
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(cookieParser());

// Connection URI for MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// List of allowed origins
const allowedOrigins = [
    "https://campusbuzz.onrender.com",
    "https://campusbuzzlpu.netlifyapp",
    "http://localhost:3000",
    "http://localhost:30010"
];


// JWT Secret Key
const secretKey = process.env.JWT_SECRET;

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
});

// Configure CORS with a function to check allowed origins
app.use(cors({
    origin: (origin, callback) => {
      // Check if the incoming request's origin is in the list of allowed origins
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }));

// Get the database and collections
const db = client.db('project');
const usersCollection = db.collection('users');
const reviewsCollection = db.collection('reviews');
const contactCollection = db.collection('contact');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token=req.cookies.token;
    // const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
}

// Route to check token validity
app.get('/check-token', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Token is valid' });
});

// Login route with JWT generation
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await usersCollection.findOne({ email });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if(passwordMatch){
            // Generate JWT token
            const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '2h' });
            
            res.cookie('token', token, {
                httpOnly: true,       // Not accessible via JavaScript
                secure: true,         // Set to true if using HTTPS
                sameSite: 'None',   // Controls whether the cookie is sent with cross-site requests
                maxAge: 7200000       // 1 hour in milliseconds
            });
            
            res.json({ token });
            }else{
                res.sendStatus(401);
        }
        }else{
            res.sendStatus(401); // Send unauthorized status
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.sendStatus(500); // Send internal server error status
    }
});

// Logout route
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    // JWT is stateless, so we just return success
    res.sendStatus(200); // Send success status
});

// Signup route with JWT generation
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }
    
    try {
        const existingUser = await usersCollection.findOne({ email });
        
        if (existingUser) {
            return res.status(409).send('Email already exists'); // Conflict status
        }

        const hashedPassword = await bcrypt.hash(password, saltrounds);
        // Insert new user into the database
        const result = await usersCollection.insertOne({ username, email, password:hashedPassword });
        
        // Generate JWT token
        const token = jwt.sign({ userId: result.insertedId, email: email }, secretKey, { expiresIn: '2h' });
        
        res.cookie('token', token, {
            httpOnly: true,       // Not accessible via JavaScript
            secure: true,         // Set to true if using HTTPS
            sameSite: 'None',   // Controls whether the cookie is sent with cross-site requests
            maxAge: 7200000       // 2 hours in milliseconds
        });

        res.json({ token }); // Return the token
    } catch (error) {
        console.error('Error during signup:', error);
        res.sendStatus(500); // Send internal server error status
    }
});

// Handling submitted reviews
app.post('/submit-reviews', verifyToken, async (req, res) => {
    const { id, title, reviewtxt, rating } = req.body;
    const intid=parseInt(id);
    
    const timestamp = new Date();

    try {
        const user= await usersCollection.findOne({_id: new ObjectId(req.userId)});
        
        if(!user){
           return res.status(404).send("User not Found");
        }
        
        await reviewsCollection.insertOne({ facility_id: intid, title, timestamp, reviewtxt, rating , author: user.username, email : user.email});
        
        res.sendStatus(200); // Send success status
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500); // Send error status
    }
});

// Handling submitted reviews by ID
app.post('/submit-reviews/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, reviewtxt, rating } = req.body;

    const timestamp = new Date();

    try {
        const user= await usersCollection.findOne({_id: new ObjectId(req.userId)});
        if(!user){
           return res.status(404).send("User not Found");
        }
        
        
        await reviewsCollection.insertOne({ facility_id: id, title, timestamp, reviewtxt, rating , author: user.username, email : user.email});

        res.sendStatus(200); // Send success status
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500); // Send error status
    }
});

app.get('/reviews/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const reviews = await reviewsCollection.find({ facility_id: id }).toArray();
        let reviewsHTML = `<div class="review-button-container">
                            <h2>Reviews</h2>
                            <a href="#" class="btn btn-primary ml-2" data-toggle="modal" data-target="#reviewModal" id="write-review-btn">Write a Review</a>
                          </div>`;
        reviews.forEach(review => {
            reviewsHTML += `
                <div class="review-container">
                    <div class="review">
                        <h6>${review.title}</h6>
                        <p><strong>Rating: ${review.rating}/5</strong></p>
                        <p>${review.reviewtxt}</p>
                        <p><em>Author: ${review.author} </em></p>
                    </div>
                </div>
            `;
        });
        res.send(reviewsHTML);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Error fetching reviews');
    }
});

// Route handler to fetch reviews based on filter
app.get('/review/:filter', async (req, res) => {
    try {
        const filter = req.params.filter;
        let query;

        switch (filter) {
            case 'all-reviews':
                query = reviewsCollection.find().limit(5);
                break;
            case 'recent-reviews':
                query = reviewsCollection.find().sort({ timestamp: -1 }).limit(5);
                break;
            case 'highest-rated':
                query = reviewsCollection.find().sort({ rating: -1 }).limit(5);
                break;
            default:
                return res.status(400).send('Invalid filter');
        }

        const reviews = await query.toArray();
        res.json(reviews);
        // let reviewsHTML = `<div class="parent-reviews"><h2>${filter.charAt(0).toUpperCase() + filter.slice(1)}</h2>`;
        // reviews.forEach(review => {
        //     reviewsHTML += `
        //             <div class="reviews-container">
        //                 <div class="review">
        //                     <h6>${review.title}</h6>
        //                     <p><strong>Rating: ${review.rating}/5</strong></p>
        //                     <p>${review.reviewtxt}</p>
        //                 </div>
        //             </div>
        //         `;
        // });
        // reviewsHTML += '</div>';
        // res.send(reviewsHTML);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Error fetching reviews');
    }
});

// Route handler to fetch popular reviews
app.get('/popular-reviews', async (req, res) => {
    try {
        const reviews = await reviewsCollection.find({}, { projection: { title: 1, reviewtxt: 1, _id: 0 } }).limit(6).toArray();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching popular reviews:', error);
        res.status(500).json({ error: 'Error fetching popular reviews' });
    }
});

// Handling POST request for contact form submission
app.post('/contact', verifyToken ,async (req, res) => {
    const { name, email, message } = req.body;
    
    try {
        await contactCollection.insertOne({ name, email, message });
        res.sendStatus(200);
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(port, '0.0.0.0' , () => {
    console.log(`Server listening at http://localhost:${port}`);
});
