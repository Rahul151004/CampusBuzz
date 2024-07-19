const { MongoClient } = require('mongodb');

// Connection URI for MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        await client.connect();

        const reviewsCollection = client.db('project').collection('reviews');
        let query;

        // Determine the filter based on the request path
        const path = event.path.replace('/.netlify/functions/', ''); // Remove Netlify Functions prefix
        switch (path) {
            case 'reviewsbyfilter/all-reviews':
                query = reviewsCollection.find().limit(5);
                break;
            case 'reviewsbyfilter/recent-reviews':
                query = reviewsCollection.find().sort({ timestamp: -1 }).limit(5);
                break;
            case 'reviewsbyfilter/highest-rated':
                query = reviewsCollection.find().sort({ rating: -1 }).limit(5);
                break;
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid filter' }),
                };
        }

        const reviews = await query.toArray();
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
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.close();
    }
};
