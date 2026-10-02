import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../auth.js';

const router = Router();

// Configure Cloudinary if environment variables exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    // If Cloudinary credentials are configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: folder || 'football_store_ids',
        resource_type: 'auto',
      });
      res.json({
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      });
      return;
    }

    // Fallback: return image (data URI or URL directly)
    res.json({
      url: image,
      publicId: `local-${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
