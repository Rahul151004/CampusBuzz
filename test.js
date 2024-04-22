const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {Pool}=require('pg');
const app = express();
const port = 3000;

// Create a PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'project',
    password: 'root',
    port: 5432, // Default PostgreSQL port
});

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
        // Query the database to find a user with the provided email and password
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 1) {
            // User found, login successful
            res.sendStatus(200); // Send success status
        } else {
            // No user found or credentials don't match
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
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // Example: Validate signup data
    if (password !== confirmPassword) {
        res.status(400).send('Passwords do not match');
    } else {
        try {
            // Insert user data into the database
            await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);
            res.sendStatus(200); // Send success status
        } catch (error) {
            console.error('Error executing query', error);
            res.sendStatus(500); // Send internal server error status
        }
    }
});

// Handling submitted reviews
app.post('/submit-reviews', async (req, res) => {
    const id = req.body.id;
    const title=req.body.title;
    const reviewtxt = req.body.reviewtxt;
    const rating = req.body.rating;

    try {
        await pool.query('INSERT INTO reviews (facility_id, title, rating, reviewtxt) VALUES ($1, $2, $3, $4)', [id, title, rating, reviewtxt]);
        res.sendStatus(200); // Send status 200 for success
    } catch (error) {
        console.log('Error executing query', error);
        res.sendStatus(500); // Send status 500 for error
    }
});

// Handling submitted reviews
app.post('/submit-reviews/:id', async (req, res) => {
    const id = req.params.id;
    const title=req.body.title;
    const reviewtxt = req.body.reviewtxt;
    const rating = req.body.rating;

    try {
        await pool.query('INSERT INTO reviews (facility_id, title, rating, reviewtxt) VALUES ($1, $2, $3, $4)', [id, title, rating, reviewtxt]);
        res.sendStatus(200); // Send status 200 for success
    } catch (error) {
        console.log('Error executing query', error);
        res.sendStatus(500); // Send status 500 for error
    }
});

app.get('/reviews/:id', async (req, res) => {
    try {
        // Fetch reviews for Food Court 1 from the database
        const id=req.params.id;
        const queryResult = await pool.query('SELECT * FROM reviews WHERE facility_id = $1', [id]);
  
        // Extract reviews data from query result
        const reviews = queryResult.rows;
  
        // Generate HTML for reviews
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
  
        // Send the HTML response to the client
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

        // Customize the query based on the filter
        switch (filter) {
            case 'all-reviews':
                query = 'SELECT * FROM reviews LIMIT 5';
                break;
            case 'recent-reviews':
                query = 'SELECT * FROM reviews ORDER BY timestamp DESC LIMIT 5';
                break;
            case 'highest-rated':
                query = 'SELECT * FROM reviews ORDER BY rating DESC LIMIT 5';
                break;
            default:
                return res.status(400).send('Invalid filter');
        }

        // Fetch reviews from the database
        const queryResult = await pool.query(query);
        const reviews = queryResult.rows;

        // Generate HTML for reviews
        if(filter=='all-reviews'){
        reviewsHTML = `<div class="parent-reviews"><h2>All Reviews</h2>`;
        }else if(filter=='recent-reviews'){
            reviewsHTML=`<div class="parent-reviews"><h2>Recent Reviews</h2>`;
        }else{
            reviewsHTML=`<div class="parent-reviews"><h2>Highest Rated Reviews</h2>`;
        }
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
        reviewsHTML+='</div>'
        // Send the HTML response to the client
        res.send(reviewsHTML);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Error fetching reviews');
    }
});

// Route handler to fetch popular reviews
app.get('/popular-reviews', async (req, res) => {
    try {
        // Fetch popular reviews from the database
        const queryResult = await pool.query('SELECT title,reviewtxt FROM reviews LIMIT 6');
        const reviews = queryResult.rows;

        // Send the popular reviews data to the client
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching popular reviews:', error);
        res.status(500).json({ error: 'Error fetching popular reviews' });
    }
});

// Handling POST request for contact form submission
app.post('/contact', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    try {
            await pool.query('INSERT INTO contact (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
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
