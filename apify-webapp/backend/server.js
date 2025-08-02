const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const APIFY_BASE_URL = 'https://api.apify.com/v2';

/**
 * A robust helper function for making authenticated requests to the Apify API.
 */
const apifyRequest = async (endpoint, token, options = {}) => {
    // Correctly appends the token with '&' or '?'
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${APIFY_BASE_URL}${endpoint}${separator}token=${token}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apify API Error: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    // Handle cases where the response body might be empty
    return responseText ? JSON.parse(responseText) : {};
};

// === API Endpoints ===

// 1. Endpoint to list a user's actors
app.post('/api/actors', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'API token is required.' });
        }
        const data = await apifyRequest('/acts', token);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Endpoint to get a specific actor's input schema
app.post('/api/actor-schema', async (req, res) => {
    try {
        const { token, actorId } = req.body;
        if (!token || !actorId) {
            return res.status(400).json({ error: 'Token and actorId are required.' });
        }

        const inputSchema = await apifyRequest(`/acts/${actorId}/input-schema`, token);
        res.json(inputSchema);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. Endpoint to run an actor and get its results
app.post('/api/run-actor', async (req, res) => {
    try {
        const { token, actorId, inputData } = req.body;
      if (!token || !actorId || !inputData || Object.keys(inputData).length === 0) {
    return res.status(400).json({ error: 'Token, actorId, and non-empty inputData are required.' });
}

        const runEndpoint = `/acts/${actorId}/runs?waitForFinish=120`;
        const runResponse = await apifyRequest(runEndpoint, token, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputData),
        });

        const runObject = runResponse.data;

        if (!runObject) {
            return res.status(500).json({ error: 'Failed to get run object from Apify.' });
        }

        if (runObject.status !== 'SUCCEEDED') {
            return res.status(400).json({
                message: 'Actor run did not succeed.',
                details: runObject,
            });
        }

        const datasetEndpoint = `/datasets/${runObject.defaultDatasetId}/items`;
        const datasetResponse = await apifyRequest(datasetEndpoint, token);

        res.json({
            message: 'Actor run succeeded!',
            results: datasetResponse,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});