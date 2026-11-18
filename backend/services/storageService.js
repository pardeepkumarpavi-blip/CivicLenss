import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('[Storage] Cloudinary configured for production media storage');
} else {
  console.log('[Storage] Cloudinary credentials not configured; using local storage for media uploads');
}

export const uploadMedia = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'civiclens/reports',
        resource_type: 'image',
        transformation: [
          { width: 1600, height: 1600, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });

      // Remove temporary local file after successful upload to Cloudinary
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageProvider: 'cloudinary'
      };
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err);
      // Fallback to local URL if Cloudinary call fails
    }
  }

  // Local storage handling
  const filename = path.basename(file.path);
  const relativeUrl = `/uploads/${filename}`;
  return {
    url: relativeUrl,
    publicId: filename,
    storageProvider: 'local'
  };
};
