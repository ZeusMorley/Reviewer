const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('.'));

// Endpoint to get list of topics
app.get('/topics', async (req, res) => {
    try {
        const topicsDir = path.join(__dirname, 'topics');
        const topics = await fs.readdir(topicsDir);
        res.json(topics);
    } catch (error) {
        console.error('Error reading topics directory:', error);
        res.status(500).json({ error: 'Failed to load topics' });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 