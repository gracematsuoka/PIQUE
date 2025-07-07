const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs/promises');
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

        response.data.on('end', async () => {
            await fs.unlink(req.file.path);
        });

        res.status(200).json({message: 'Processed image'})
    } catch (err) {
        console.error('Error sending image to Python service:', err.message);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

router.get('/get-upload-url', async (req, res) => {
    try {
        const response = await fetch(`${process.env.CF_IMAGES_API}/images/v2/direct_upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CF_IMAGES_TOKEN}`
            }
        });

        const data = await response.json();
        res.status(200).json({uploadURL: data.result.uploadURL});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;