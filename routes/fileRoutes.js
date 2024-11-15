const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Helper function to construct file/folder paths 
function getFilePath(dir, name) {
    return path.join(__dirname, '../uploads', dir || '', name);
}

// Configure `multer` to handle both file fields and form fields together
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = getFilePath(req.body.dir || '', '');
        console.log("Parsed req.body.dir:", req.body.dir); 

        // Create the directory if it doesn't exist
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Failed to create directory:', err);
                return cb(new Error("Failed to create directory"));
            }
            cb(null, uploadPath);
        });
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Single route to handle file uploads
router.post('/upload-multiple', 
    upload.fields([{ name: 'files', maxCount: 5 }]), 
    (req, res) => {
        //console.log("Parsed req.body.dir in handler:", req.body.dir); 
        //console.log('Uploaded files:', req.files.files); 
        
        res.send(`${req.files.files.length} files uploaded successfully to /uploads/${req.body.dir || ''}`);
    }
);

// Delete file
router.delete('/delete-file', (req, res) => {
    const filePath = getFilePath(req.body.dir, req.body.filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Failed to delete file:', err);
            return res.status(500).send('Failed to delete file');
        }
        res.send('File deleted successfully');
    });
});

// Download file
router.get('/download-file', (req, res) => {
    const filePath = getFilePath(req.query.dir, req.query.filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error('Failed to download file:', err);
            return res.status(500).send('Failed to download file');
        }
    });
});

// Rename file
router.post('/rename-file', (req, res) => {
    const { dir, oldName, newName } = req.body;

    const oldPath = getFilePath(dir, oldName);
    const newPath = getFilePath(dir, newName);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('Failed to rename file:', err);
            return res.status(500).send('Failed to rename file');
        }
        res.send('File renamed successfully');
    });
});

module.exports = router;
