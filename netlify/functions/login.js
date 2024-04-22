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
const usersCollection = db.collection('users');

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await usersCollection.findOne({ email, password });
        if (user) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('Error executing query', error);
        res.sendStatus(500);
    }
});
module.exports.handler = serverless(app);
module.exports = app;
