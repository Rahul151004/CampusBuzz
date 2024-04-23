const { MongoClient } = require('mongodb');
const queryString = require('querystring');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        const requestBody = queryString.parse(event.body);
        const path = event.path.replace('/.netlify/functions/', ''); // Extract path without prefix
        const id = parseInt(path.split('/').pop()); // Extract id from the path
        const { title, reviewtxt, rating } = requestBody;

        await client.connect();

        const db = client.db('project');
        const reviewsCollection = db.collection('reviews');

        await reviewsCollection.insertOne({ facility_id: id, title, timestamp,reviewtxt, rating });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Review submitted successfully' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.close();
    }
};
