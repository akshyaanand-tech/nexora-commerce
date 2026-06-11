import { Router } from 'express';
import multer from 'multer';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  if (!isCloudinaryConfigured) {
    return res.status(503).json({
      message: 'Cloudinary not configured. Add credentials to .env or use image URLs directly.',
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No image provided' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'nexora/products', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;
