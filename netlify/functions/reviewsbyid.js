const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        await client.connect();

        const db = client.db('project');
        const reviewsCollection = db.collection('reviews');

        console.log('Received request with event:', event);

        // Log the entire event object
        console.log('Event:', event);

        const pathParameters = event.pathParameters;
        console.log('Path parameters:', pathParameters);

        if (!pathParameters || !pathParameters.id) {
            throw new Error('ID parameter not found in path parameters');
        }

        const id = parseInt(pathParameters.id);
        console.log('Parsed ID:', id);

        const reviews = await reviewsCollection.find({ facility_id: id }).toArray();
        console.log('Retrieved reviews:', reviews);

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
