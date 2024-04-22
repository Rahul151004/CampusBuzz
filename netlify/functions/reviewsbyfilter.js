const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');

// Initialize Express app
const express = require('express');
const app = express();

// Connection URI for MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
});

// Get the database and reviews collection
const db = client.db('project');
const reviewsCollection = db.collection('reviews');

// Route handler to fetch reviews based on filter
app.get('/reviewsbyfilter/:filter', async (req, res) => {
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

// Export the Express app
module.exports.handler = serverless(app);
module.exports = app;
