const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');

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
const usersCollection = db.collection('users');

// Handler function for signup
const signupHandler = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        res.status(400).send('Passwords do not match');
    } else {
        try {
            await usersCollection.insertOne({ username, email, password });
            res.sendStatus(200);
        } catch (error) {
            console.error('Error executing query', error);
            res.sendStatus(500);
        }
    }
};

// Route for signup
app.post('/signup', signupHandler);

// Wrap the app with serverless handler
module.exports.handler = serverless(app);
