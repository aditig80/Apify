const express = require('express');
const cors = require('cors');
const apifyService = require('./apifyService');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/actors', apifyService.fetchActors);
app.post('/schema', apifyService.fetchSchema);
app.post('/run-actor', apifyService.runActor);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
