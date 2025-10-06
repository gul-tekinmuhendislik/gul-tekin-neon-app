import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadVarmeksLogo() {
  try {
    console.log('Uploading Varmeks logo to Cloudinary...');

    const result = await cloudinary.uploader.upload(
      path.join(process.cwd(), 'public/varmek.png'),
      {
        folder: 'markalar',
        public_id: 'varmeks-logo',
        overwrite: true,
        resource_type: 'image'
      }
    );

    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);

  } catch (error) {
    console.error('Error uploading logo:', error);
  }
}

uploadVarmeksLogo();
