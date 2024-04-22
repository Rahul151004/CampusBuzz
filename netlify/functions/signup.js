const { MongoClient } = require('mongodb');
const queryString = require('querystring');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        const requestBody = queryString.parse(event.body);
        const { username, email, password, confirmPassword } = requestBody;

        await client.connect();

        const usersCollection = client.db('project').collection('users');

        if (password !== confirmPassword) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Passwords do not match' }),
            };
        } else {
            await usersCollection.insertOne({ username, email, password });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Signup successful' }),
            };
        }
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
