// Import necessary modules
const { MongoClient } = require('mongodb');
const queryString = require('querystring');

// Connection URI for MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Handler function to handle the login request
exports.handler = async (event, context) => {
    try {
        // Parse the request body
        const requestBody = queryString.parse(event.body);
        const { email, password } = requestBody;

        // Connect to MongoDB
        await client.connect();

        // Get the users collection
        const usersCollection = client.db('project').collection('users');

        // Find the user with the provided email and password
        const user = await usersCollection.findOne({ email, password });

        // Close the MongoDB connection
        await client.close();

        // Check if user exists
        if (user) {
            // Return success response
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Login successful' }),
            };
        } else {
            // Return unauthorized response
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
