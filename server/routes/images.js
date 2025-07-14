const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsp = require('fs/promises');
const fetch = require('node-fetch');
const Jimp = require('jimp');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));
    try {
        const response = await axios.post(`${process.env.PYTHON_SERVICE_API}/remove-bg`, formData,
        {
            headers: formData.getHeaders(),
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data);

        const croppedImg = await cropImage(imageBuffer);

        res.setHeader('Content-Type', 'image/png');
        res.send(croppedImg);

        await fsp.unlink(req.file.path);

        // response.data.on('end', async () => {
        //     try {
        //         await fsp.unlink(req.file.path);
        //     } catch (err) {
        //         console.error('File cleanup failed:', err);
        //     }
        // });

        // response.data.on('error', async (err) => {
        //     console.error('Stream error:', err);
        //     res.end(); 
        //     try {
        //         await fsp.unlink(req.file.path);
        //     } catch (e) {
        //         console.error('File cleanup failed after stream error:', e);
        //     }
        // });
    } catch (err) {
        console.error('Error sending image to Python service:', err.message);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

const cropImage = async (img) => {
    const input = await Jimp.read(img);

    const {width, height} = input.bitmap;

    let minX = width, minY = height, maxX = 0, maxY = 0;

    input.scan(0, 0, width, height, function (x, y, idx) {
        const alpha = input.bitmap.data[idx + 3];
        if (alpha > 0) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    });

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    const cropped = input.clone().crop(minX, minY, cropWidth, cropHeight);
    return await cropped.getBufferAsync(Jimp.MIME_PNG);
}

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