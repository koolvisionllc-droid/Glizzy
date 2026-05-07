import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const imagesDir = path.join(rootDir, 'images');
const dataDir = path.join(rootDir, 'data');
const outputFile = path.join(dataDir, 'photos.json');

const categories = [
  { folder: 'events', category: 'event' },
  { folder: 'concerts', category: 'concert' },
  { folder: 'portraits', category: 'portrait' },
  { folder: 'travel', category: 'travel' }
];

function toTitle(str) {
  return str
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function buildPhotoObject(filePath, category) {
  const relPath = filePath.replace(rootDir + path.sep, '').replace(/\\/g, '/');
  const filename = path.basename(filePath);
  const baseTitle = toTitle(filename);

  return {
    src: relPath,
    alt: baseTitle,
    caption: baseTitle,
    category,
    date_taken: null,
    location: {
      city: null,
      state: null,
      country: null,
      venue: null
    },
    camera: {
      make: null,
      model: null,
      lens: null
    },
    tags: [category],
    orientation: "landscape",
    aspect_ratio: "3:2"
  };
}

function getImagesInFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath);
  return files
    .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .map(f => path.join(folderPath, f));
}

async function main() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let photos = [];

  for (const { folder, category } of categories) {
    const folderPath = path.join(imagesDir, folder);
    const imageFiles = getImagesInFolder(folderPath);

    imageFiles.forEach(filePath => {
      photos.push(buildPhotoObject(filePath, category));
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(photos, null, 2), 'utf8');
  console.log(`Generated ${photos.length} photo entries in data/photos.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
