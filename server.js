const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT;

// Connection URI for MongoDB
const uri = '***REMOVED***';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
});

// Get the database and collections
const db = client.db('project');
const usersCollection = db.collection('users');
const reviewsCollection = db.collection('reviews');
const contactCollection = db.collection('contact');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Login route
app.post('/login', async (req, res) => {
    // Handle login logic here
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await usersCollection.findOne({ email, password });
        if (user) {
            res.sendStatus(200); // Send success status
        } else {
            res.sendStatus(401); // Send unauthorized status
        }
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500); // Send internal server error status
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    // Handle signup logic here
    const { username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        res.status(400).send('Passwords do not match');
    } else {
        try {
            await usersCollection.insertOne({ username, email, password });
            res.sendStatus(200); // Send success status
        } catch (error) {
            console.error('Error executing query', error);
            res.sendStatus(500); // Send internal server error status
        }
    }
});

// Handling submitted reviews
app.post('/submit-reviews', async (req, res) => {
    const { id, title, reviewtxt, rating } = req.body;
    try {
        await reviewsCollection.insertOne({ facility_id: parseInt(id), title, reviewtxt, rating });
        res.sendStatus(200); // Send status 200 for success
    } catch (error) {
        console.log('Error executing query', error);
        res.sendStatus(500); // Send status 500 for error
    }
});

// Handling submitted reviews
app.post('/submit-reviews/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, reviewtxt, rating } = req.body;
    try {
        await reviewsCollection.insertOne({ facility_id: id, title, reviewtxt, rating });
        res.sendStatus(200); // Send status 200 for success
    } catch (error) {
        console.log('Error executing query', error);
        res.sendStatus(500); // Send status 500 for error
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
        let reviewsHTML = `<div class="parent-reviews"><h2>${filter.charAt(0).toUpperCase() + filter.slice(1)}</h2>`;
        reviews.forEach(review => {
            reviewsHTML += `
                    <div class="reviews-container">
                        <div class="review">
                            <h6>${review.title}</h6>
                            <p><strong>Rating: ${review.rating}/5</strong></p>
                            <p>${review.reviewtxt}</p>
                        </div>
                    </div>
                `;
        });
        reviewsHTML += '</div>';
        res.send(reviewsHTML);
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
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await contactCollection.insertOne({ name, email, message });
        res.sendStatus(200);
    } catch (error) {
        console.log('Error executing query', error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
