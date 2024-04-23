const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        await client.connect();

        const db = client.db('project');
        const reviewsCollection = db.collection('reviews');

        const pathParameters = event.pathParameters;
        if (!pathParameters || !pathParameters.id) {
            throw new Error('ID parameter not found in path parameters');
        }

        const id = parseInt(event.pathParameters.id);
        console.log(id);
        const reviews = await reviewsCollection.find({ facility_id: id }).toArray();
        console.log(reviews);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reviews),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.close();
    }
};
