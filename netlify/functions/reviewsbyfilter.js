const express = require('express');
const { MongoClient } = require('mongodb');
const serverless=require('serverless-http');
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

app.get('/reviews/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const reviews = await reviewsCollection.find({ facility_id: id }).toArray();
        // Construct HTML response
        res.send(/* Constructed HTML */);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Error fetching reviews');
    }
});
module.exports.handler = serverless(app);
module.exports = app;
