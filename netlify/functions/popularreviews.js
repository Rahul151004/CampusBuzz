const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
});

const db = client.db('project');
const reviewsCollection = db.collection('reviews');

app.get('/popular-reviews', async (req, res) => {
    try {
        const reviews = await reviewsCollection.find({}, { projection: { title: 1, reviewtxt: 1, _id: 0 } }).limit(6).toArray();
        // Send JSON response
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching popular reviews:', error);
        res.status(500).json({ error: 'Error fetching popular reviews' });
    }
});

module.exports = app;
p