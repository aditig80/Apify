const axios = require('axios');

exports.fetchActors = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const response = await axios.get('https://api.apify.com/v2/acts', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.fetchSchema = async (req, res) => {
  try {
    const { apiKey, actorId } = req.body;
    const response = await axios.get(`https://api.apify.com/v2/acts/${actorId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const schema = response.data.data.input?.schema;
    res.json({ schema });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.runActor = async (req, res) => {
  try {
    const { apiKey, actorId, input } = req.body;

    const run = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs?wait=1`,
      input,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    res.json(run.data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
