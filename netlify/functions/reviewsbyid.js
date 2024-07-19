const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        console.log('Event:', event); // Log the event object to inspect its structure
        
        await client.connect();

        const db = client.db('project');
        const reviewsCollection = db.collection('reviews');

        // Extract ID from the path
        const path = event.path.replace('/.netlify/functions/', '');
        const id = path.split('/').pop(); // Get the last segment of the path as the ID
        
        if (!id) {
            throw new Error('ID not found in the path');
        }

        const reviews = await reviewsCollection.find({ facility_id: parseInt(id) }).toArray();
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
