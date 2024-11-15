const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Helper function to construct file/folder paths (maybe worth creating utils folder?)
function getFilePath(dir, name) {
    return path.join(__dirname, '../uploads', dir || '', name);
}

// Route to create a directory within a specified directory
router.post('/create-folder', async (req, res) => {
    const folderName = req.body.folderName;
    const dir = req.body.dir || ''; 
    

    if (!folderName) {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    // Use the helper function to construct the full path
    const folderPath = getFilePath(dir, folderName);

    try {
        await fs.mkdir(folderPath, { recursive: true, mode: 0o777 });
        
        res.json({ message: 'Folder created successfully' });
    } catch (error) {
        console.error('Failed to create folder:', error);
        res.status(500).json({ message: 'Failed to create folder', error: error.toString() });
    }
});


// Route to delete a directory
router.delete('/delete-folder', async (req, res) => {
    const folderPathRelative = req.body.folderPath; 
    if (!folderPathRelative) {
        return res.status(400).send('Folder path is required.');
    }

    const folderPath = path.join(__dirname, '..', 'uploads', folderPathRelative);

    console.log("Folder Path to delete: ", folderPath);

    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        
        res.send('Folder deleted successfully');
    } catch (error) {
        console.error('Failed to delete folder:', error);
        res.status(500).send('Failed to delete folder');
    }
});


// Route to rename a folder
router.post('/rename-folder', async (req, res) => {
    const { dir, oldName, newName } = req.body;

    const oldPath = getFilePath(dir, oldName);
    const newPath = getFilePath(dir, newName);

    try {
        await fs.rename(oldPath, newPath); 
        
        res.json({ message: 'Directory renamed successfully' });
    } catch (err) {
        console.error('Failed to rename directory:', err);
        res.status(500).json({ message: 'Failed to rename directory' });
    }
});


module.exports = router;
