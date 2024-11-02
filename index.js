const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = 3000;

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: 'messi7788',
    port: 5432,
});

// Middleware to parse JSON in request body
app.use(express.json());

// Serve static files (images and CSS)
app.use('/images', express.static('images'));
app.use(express.static('public'));

// Route to serve the HTML page on the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get two random images
app.get('/random-images', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM photos
            ORDER BY RANDOM()
            LIMIT 2;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching random images:', err);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Route to handle voting for an image
app.post('/vote', async (req, res) => {
    const { id } = req.body;

    try {
        await pool.query(`
            UPDATE photos
            SET votes = votes + 1
            WHERE id = $1;
        `, [id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating votes:', err);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// Route to get leaderboard of top-voted images
app.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM photos
            ORDER BY votes DESC
            LIMIT 10;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
