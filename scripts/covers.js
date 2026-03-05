#!/usr/bin/env node
/*
  Watches public/images/covers and auto-resizes any added/changed images to 320x480 in-place.
  Usage:
    - node scripts/covers.js --watch  # start watcher
    - node scripts/covers.js --all    # process all existing images once
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const chokidar = require('chokidar');

const COVERS_DIR = path.join(process.cwd(), 'public', 'images', 'covers');
const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 480;
const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function isSupported(filePath) {
  return SUPPORTED_EXT.has(path.extname(filePath).toLowerCase());
}

async function resizeImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const image = sharp(buffer, { failOn: 'none' });
    const metadata = await image.metadata();

    // Skip if already the right size
    if (metadata.width === TARGET_WIDTH && metadata.height === TARGET_HEIGHT) {
      return;
    }

    let pipeline = image.resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' });
    const format = (metadata.format || '').toLowerCase();
    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true, adaptiveFiltering: true });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: 82 });
    }

    const resized = await pipeline.toBuffer();

    fs.writeFileSync(filePath, resized);
    console.log(`[covers] Resized: ${path.basename(filePath)} -> ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  } catch (err) {
    console.error(`[covers] Failed to process ${filePath}:`, err.message);
  }
}

async function processAll() {
  if (!fs.existsSync(COVERS_DIR)) {
    console.error(`[covers] Directory not found: ${COVERS_DIR}`);
    process.exit(1);
  }
  const files = fs.readdirSync(COVERS_DIR)
    .map((f) => path.join(COVERS_DIR, f))
    .filter(isSupported);
  await Promise.all(files.map(resizeImage));
}

function watchDir() {
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }
  console.log(`[covers] Watching ${COVERS_DIR} for new/changed images...`);
  const watcher = chokidar.watch(COVERS_DIR, { ignoreInitial: true, awaitWriteFinish: true });

  const onChange = (filePath) => {
    if (!isSupported(filePath)) return;
    resizeImage(filePath);
  };

  watcher
    .on('add', onChange)
    .on('change', onChange)
    .on('error', (err) => console.error('[covers] watcher error:', err));
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--all')) {
    await processAll();
    return;
  }
  watchDir();
}

main();


