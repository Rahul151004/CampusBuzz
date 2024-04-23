const { MongoClient } = require('mongodb');
const queryString = require('querystring');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        const requestBody = queryString.parse(event.body);
        const { name, email, message } = requestBody;
        
        await client.connect();

        const db = client.db('project');
        const contactCollection = db.collection('contact');

        await contactCollection.insertOne({ name, email, message });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Contact details submitted successfully' }),
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
