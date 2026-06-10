import { createClient } from 'next-sanity';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Validate Env variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('❌ Error: Missing environment variables.');
  console.log('\nPlease ensure the following are set in your environment before running:');
  console.log(' - NEXT_PUBLIC_SANITY_PROJECT_ID');
  console.log(' - SANITY_API_WRITE_TOKEN (Token with Editor/Write access created in Sanity Manage)');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-10',
  token,
  useCdn: false,
});

async function uploadImage(filename: string) {
  const filePath = join(process.cwd(), 'public/images', filename);
  if (!existsSync(filePath)) {
    console.warn(`⚠️ Warning: Image file not found at ${filePath}, skipping upload.`);
    return null;
  }
  try {
    console.log(`Uploading ${filename}...`);
    const fileBuffer = readFileSync(filePath);
    const asset = await client.assets.upload('image', fileBuffer, {
      filename,
    });
    console.log(`✅ Uploaded ${filename} (${asset._id})`);
    return asset._id;
  } catch (error) {
    console.error(`❌ Failed to upload image ${filename}:`, error);
    return null;
  }
}

async function seed() {
  console.log('🚀 Starting Sanity Database Seeding...');
  
  // 1. Upload Images
  const domeAssetId = await uploadImage('dome.png');
  const birthdayAssetId = await uploadImage('birthday_v3.png');
  const anniversaryAssetId = await uploadImage('anniversary.png');
  const genderrevealAssetId = await uploadImage('genderreveal_v2.png');
  const celebrationsAssetId = await uploadImage('celebrations.png');

  // Helper for image reference
  const imageRef = (assetId: string | null) => {
    if (!assetId) return undefined;
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: assetId,
      },
    };
  };

  // 2. Seed Slides
  const slides = [
    {
      _id: 'slide-1',
      _type: 'heroSection',
      title: 'DOME CAFE',
      subtitle: 'Hyderabad',
      italicText: "India's first dome-shaped celebration café",
      currentImage: imageRef(domeAssetId),
      nextImage: imageRef(birthdayAssetId),
      isFirst: true,
      showButtons: false,
      order: 1,
    },
    {
      _id: 'slide-2',
      _type: 'heroSection',
      title: 'CELEBRATE YOUR BIRTHDAY',
      subtitle: 'Private dome · Balloon décor · LED signs',
      currentImage: imageRef(birthdayAssetId),
      nextImage: imageRef(anniversaryAssetId),
      badgeText: '✦ Packages from ₹999 ✦',
      isFirst: false,
      showButtons: false,
      order: 2,
    },
    {
      _id: 'slide-3',
      _type: 'heroSection',
      title: 'YOU LOVE MOST',
      subtitle: 'Anniversaries · Gender Reveals · Romantic Dinners',
      italicText: 'FOR THE ONES',
      currentImage: imageRef(anniversaryAssetId),
      nextImage: imageRef(genderrevealAssetId),
      isFirst: false,
      showButtons: true,
      order: 3,
    },
    {
      _id: 'slide-4',
      _type: 'heroSection',
      title: 'REVEAL',
      subtitle: 'Magical gender reveal celebrations',
      italicText: 'THE BIG',
      currentImage: imageRef(genderrevealAssetId),
      nextImage: imageRef(celebrationsAssetId),
      isFirst: false,
      showButtons: false,
      order: 4,
    },
    {
      _id: 'slide-5',
      _type: 'heroSection',
      title: 'ANY OCCASION',
      subtitle: 'BIRTHDAYS · FAREWELLS · GET-TOGETHERS',
      italicText: 'For Every Occasion',
      currentImage: imageRef(celebrationsAssetId),
      nextImage: imageRef(celebrationsAssetId),
      isFirst: false,
      showButtons: true,
      order: 5,
    },
  ];

  console.log('\n--- Seeding Slides ---');
  for (const slide of slides) {
    console.log(`Publishing slide: ${slide.title}...`);
    await client.createOrReplace(slide);
  }
  console.log('✅ Slides seeding completed.');

  // 3. Seed Packages
  const packages = [
    {
      _id: 'package-classic',
      _type: 'domePackage',
      name: 'CLASSIC',
      price: '₹999',
      duration: '1.5 hrs',
      features: ['Balloon décor', 'LED name sign', 'Rose petals', 'Candles', 'Seating for 2'],
      tag: null,
      order: 1,
    },
    {
      _id: 'package-premium',
      _type: 'domePackage',
      name: 'PREMIUM',
      price: '₹1,499',
      duration: '1.5 hrs',
      features: ['Everything in Classic', 'Floral arch', 'Chamomile welcome drink', 'Polaroid camera', 'Priority booking'],
      tag: 'MOST POPULAR',
      order: 2,
    },
    {
      _id: 'package-grand',
      _type: 'domePackage',
      name: 'GRAND',
      price: '₹2,199',
      duration: '2 hrs',
      features: ['Everything in Premium', 'Custom neon sign', 'Cake + sparklers', 'Dedicated host', 'Video reel edit'],
      tag: null,
      order: 3,
    },
  ];

  console.log('\n--- Seeding Packages ---');
  for (const pkg of packages) {
    console.log(`Publishing package: ${pkg.name}...`);
    await client.createOrReplace(pkg);
  }
  console.log('✅ Packages seeding completed.');

  // 4. Seed Reviews
  const reviews = [
    {
      _id: 'review-1',
      _type: 'review',
      name: 'Priya M.',
      text: 'The dome was magical. Best birthday surprise ever.',
      stars: 5,
    },
    {
      _id: 'review-2',
      _type: 'review',
      name: 'Arjun K.',
      text: 'Proposed here. She said yes. The setup was perfect.',
      stars: 5,
    },
    {
      _id: 'review-3',
      _type: 'review',
      name: 'Sneha R.',
      text: 'Absolutely stunning experience. Worth every rupee.',
      stars: 5,
    },
    {
      _id: 'review-4',
      _type: 'review',
      name: 'Vikram T.',
      text: 'Private, intimate, beautifully decorated. 10/10.',
      stars: 5,
    },
    {
      _id: 'review-5',
      _type: 'review',
      name: 'Divya S.',
      text: 'The team handled everything. We just showed up and celebrated.',
      stars: 5,
    },
  ];

  console.log('\n--- Seeding Reviews ---');
  for (const review of reviews) {
    console.log(`Publishing review by: ${review.name}...`);
    await client.createOrReplace(review);
  }
  console.log('✅ Reviews seeding completed.');

  console.log('\n🎉 Seeding finished successfully! Refresh your Sanity Studio to see the documents.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
