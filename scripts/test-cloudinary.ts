import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);

    // Try to list all folders
    console.log('\nListing all folders:');
    const folders = await cloudinary.api.root_folders();
    console.log('Folders:', JSON.stringify(folders, null, 2));

    // Check subfolders in varmeks-solimpeks
    console.log('\nChecking subfolders in varmeks-solimpeks:');
    const subfolders = await cloudinary.api.sub_folders('varmeks-solimpeks');
    console.log('Subfolders:', JSON.stringify(subfolders, null, 2));

    // Try to get ALL resources (not just upload type) from varmeks-solimpeks
    console.log('\nTrying to fetch ALL resource types from varmeks-solimpeks:');

    // Try different type values
    for (const type of ['upload', 'private', 'authenticated']) {
      try {
        const result = await cloudinary.api.resources({
          type: type,
          prefix: 'varmeks-solimpeks',
          max_results: 100,
          resource_type: 'image'
        });
        console.log(`\nType "${type}": Found ${result.resources.length} images`);
        if (result.resources.length > 0) {
          console.log('Images:', JSON.stringify(result.resources.map((r: any) => r.public_id), null, 2));
        }
      } catch (err: any) {
        console.log(`Type "${type}": Error -`, err.message);
      }
    }

    // Also try using the folder parameter directly
    console.log('\n\nTrying with folder filter (asset_folder):');
    try {
      const folderResult = await cloudinary.api.resources_by_asset_folder('varmeks-solimpeks', {
        max_results: 100
      });
      console.log(`Found ${folderResult.resources.length} images in folder`);
      if (folderResult.resources.length > 0) {
        console.log('Images:', JSON.stringify(folderResult.resources.map((r: any) => r.public_id), null, 2));
      }
    } catch (err: any) {
      console.log('Folder filter error:', err.message);
    }

    // Search for varmeks or solimpeks in all images
    console.log('\n\nSearching for images with "varmeks" or "solimpeks":');
    const searchResult = await cloudinary.search
      .expression('asset_folder=varmeks-solimpeks')
      .max_results(30)
      .execute();
    console.log('Search found:', searchResult.total_count, 'images');
    if (searchResult.resources.length > 0) {
      console.log('Search results:', JSON.stringify(searchResult.resources.map((r: any) => ({ id: r.public_id, folder: r.asset_folder })), null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testCloudinary();
