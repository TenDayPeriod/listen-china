import sharp from 'sharp'
import { readdir, stat, rename } from 'fs/promises'
import { join } from 'path'

const IMG_DIR = 'public/img'
const MAX_WIDTH = 1200
const QUALITY = 80

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else if (entry.name.match(/\.(jpg|jpeg|png)$/i)) {
      yield fullPath
    }
  }
}

async function compressImage(filePath) {
  const stats = await stat(filePath)
  const originalSize = stats.size

  const tempPath = filePath + '.tmp'

  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tempPath)

  const newStats = await stat(tempPath)
  const newSize = newStats.size

  await rename(tempPath, filePath)

  const saved = ((1 - newSize / originalSize) * 100).toFixed(1)
  console.log(`${filePath}: ${(originalSize / 1024).toFixed(0)}KB -> ${(newSize / 1024).toFixed(0)}KB (-${saved}%)`)
}

async function main() {
  console.log('开始压缩图片...\n')
  let count = 0

  for await (const filePath of walk(IMG_DIR)) {
    try {
      await compressImage(filePath)
      count++
    } catch (err) {
      console.error(`压缩失败: ${filePath} - ${err.message}`)
    }
  }

  console.log(`\n完成！共压缩 ${count} 张图片`)
}

main()
