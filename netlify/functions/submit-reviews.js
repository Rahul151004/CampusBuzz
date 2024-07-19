const { MongoClient } = require('mongodb');
const queryString = require('querystring');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        const requestBody = queryString.parse(event.body);
        const { id, title, reviewtxt, rating } = requestBody;
        const timestamp = new Date();

        await client.connect();

        const reviewsCollection = client.db('project').collection('reviews');

        await reviewsCollection.insertOne({ facility_id: parseInt(id), title, timestamp, reviewtxt, rating });

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
