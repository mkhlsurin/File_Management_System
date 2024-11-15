
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Route to get directory contents
router.get('/files', async (req, res) => {

    // Get the directory from the query or default to the uploads root
    let dir = req.query.dir ? req.query.dir : '';
    const fullPath = path.join(__dirname, '../uploads', dir);

    try {
        const files = await fs.readdir(fullPath, { withFileTypes: true });
        const fileList = files.map(file => ({
            name: file.name,
            type: file.isDirectory() ? 'Directory' : 'File'
        }));
        res.json({ path: dir, files: fileList });
    } catch (error) {
        console.error('Error reading directory:', error);
        res.status(500).send('Error reading directory');
    }
});

module.exports = router;