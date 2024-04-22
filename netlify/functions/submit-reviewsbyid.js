const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const serverless=require('serverless-http');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post('/submit-reviews/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, reviewtxt, rating } = req.body;
    try {
        await reviewsCollection.insertOne({ facility_id: id, title, reviewtxt, rating });
        res.sendStatus(200); // Send status 200 for success
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500); // Send status 500 for error
    }
});
module.exports.handler = serverless(app);
module.exports = app;
