const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    try {
        const response = await axios.post(`${process.env.PYTHON_SERVICE_API}/remove-bg`, formData,
        {
            headers: formData.getHeaders(),
            responseType: 'stream',
        });
        res.setHeader('Content-Type', 'image/png');
        response.data.pipe(res);
    } catch (err) {
        console.error('Error sending image to Python service:', err.message);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

router.get('/get-upload-url', async (req, res) => {
    const response = await fetch(`${process.env.CF_IMAGES_API}/images/v2/direct_upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.CF_IMAGES_TOKEN}`
        }
    });

    const data = await response.json();
    res.json({uploadURL: data.result.uploadURL});
})

module.exports = router;