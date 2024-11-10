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

// Serve static files (images, CSS, and music)
app.use('/images', express.static('images'));
app.use(express.static('public'));

// Route to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the joke HTML page
app.get('/joke.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'joke.html'));
});

// Route to get two random images
app.get('/random-images', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM photos ORDER BY RANDOM() LIMIT 2;`);
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
        await pool.query(`UPDATE photos SET votes = votes + 1 WHERE id = $1;`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating votes:', err);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// Route to get leaderboard of top-voted images
app.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM photos ORDER BY votes DESC LIMIT 10;`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Route to submit a new joke with a username
app.post('/submit-joke', async (req, res) => {
    const { username, text } = req.body;
    try {
        await pool.query(
            `INSERT INTO jokes (username, text, likes, dislikes) VALUES ($1, $2, 0, 0);`,
            [username, text]
        );
        res.json({ success: true, message: 'Joke submitted successfully' });
    } catch (err) {
        console.error('Error submitting joke:', err);
        res.status(500).json({ error: 'Failed to submit joke' });
    }
});

// Route to get a list of jokes ordered by likes
app.get('/get-jokes', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM jokes ORDER BY likes DESC;`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching jokes:', err);
        res.status(500).json({ error: 'Failed to fetch jokes' });
    }
});

// Route to handle voting for a joke (like or dislike)
app.post('/vote-joke', async (req, res) => {
    const { id, isLike } = req.body;
    const column = isLike ? 'likes' : 'dislikes';
    try {
        await pool.query(`UPDATE jokes SET ${column} = ${column} + 1 WHERE id = $1;`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating joke votes:', err);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// Route to get two random jokes for comparison
app.get('/random-jokes', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM jokes ORDER BY RANDOM() LIMIT 2;`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching random jokes:', err);
        res.status(500).json({ error: 'Failed to fetch jokes' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
