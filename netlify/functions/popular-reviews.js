const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        await client.connect();

        const reviewsCollection = client.db('project').collection('reviews');
        const reviews = await reviewsCollection.find({}, { projection: { title: 1, reviewtxt: 1, _id: 0 } }).limit(6).toArray();
        console.log(reviews);
        return {
            statusCode: 200,
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
