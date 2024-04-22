const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

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
const contactCollection = db.collection('contact');

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await contactCollection.insertOne({ name, email, message });
        res.sendStatus(200);
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500);
    }
});

module.exports = app;
