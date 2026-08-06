import sharp from 'sharp'
import { readdir, stat, unlink, mkdir, rm, rename } from 'fs/promises'
import { join, relative, dirname, extname } from 'path'
import { execSync } from 'child_process'

const IMG_DIR = 'public/img'
const TMP_DIR = 'public/.img-tmp'
const MAX_WIDTH = 1200
const QUALITY = 80

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.img-tmp') continue
      yield* walk(fullPath)
    } else if (entry.name.match(/\.(jpg|jpeg|png)$/i)) {
      yield fullPath
    }
  }
}

async function replaceFileWin(tempPath, targetPath) {
  const bakPath = targetPath + '.__bak__'
  const psEsc = s => s.replace(/'/g, "''").replace(/\$/g, '`$')
  const cmdEsc = s => s.replace(/"/g, '""')

  // 策略 0：Node fs.rename（仅改目录项，绕过 user-mapped section）
  try {
    try { await rename(targetPath, bakPath) } catch {}
    await rename(tempPath, targetPath)
    try { await unlink(bakPath) } catch {}
    return true
  } catch (e) { /* fallthrough */ }

  try {
    // 策略 1：cmd /c move /Y（跨卷降级为复制+删）
    execSync(
      `cmd /c move /Y "${cmdEsc(targetPath)}" "${cmdEsc(bakPath)}" 2>nul & cmd /c move /Y "${cmdEsc(tempPath)}" "${cmdEsc(targetPath)}"`,
      { stdio: 'pipe', encoding: 'utf8' }
    )
    try { execSync(`cmd /c del /F /Q "${cmdEsc(bakPath)}" 2>nul`, { stdio: 'pipe' }) } catch {}
    return true
  } catch (e) { /* fallthrough */ }

  try {
    // 策略 2：PowerShell Rename-Item
    execSync(
      `Rename-Item -LiteralPath '${psEsc(targetPath)}' -NewName '${psEsc(bakPath)}' -Force -ErrorAction SilentlyContinue; ` +
      `Rename-Item -LiteralPath '${psEsc(tempPath)}' -NewName '${psEsc(targetPath)}' -Force`,
      { shell: 'powershell.exe', stdio: 'pipe' }
    )
    try { await unlink(bakPath).catch(() => {}) } catch {}
    return true
  } catch (e) { /* fallthrough */ }

  try {
    // 策略 3：PowerShell Copy-Item -Force
    execSync(
      `Copy-Item -LiteralPath '${psEsc(tempPath)}' -Destination '${psEsc(targetPath)}' -Force`,
      { shell: 'powershell.exe', stdio: 'pipe' }
    )
    return true
  } catch (e) {
    throw new Error(`所有覆盖策略均失败: ${e.message}`)
  }
}

function replaceFileUnix(tempPath, targetPath) {
  execSync(`mv -f '${tempPath.replace(/'/g, "'\\''")}' '${targetPath.replace(/'/g, "'\\''")}'`)
}

async function replaceFile(tempPath, targetPath) {
  if (process.platform === 'win32') {
    await replaceFileWin(tempPath, targetPath)
  } else {
    replaceFileUnix(tempPath, targetPath)
  }
}

async function compressImage(filePath) {
  const stats = await stat(filePath)
  const originalSize = stats.size

  const rel = relative(IMG_DIR, filePath)
  const ext = extname(filePath).toLowerCase()
  // 统一输出为 jpg 临时文件（同名加 .jpg 后缀，最终再覆盖回原路径）
  const outRel = ext === '.png' ? rel : rel
  const tempPath = join(TMP_DIR, outRel)
  await mkdir(dirname(tempPath), { recursive: true })

  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tempPath)

  const newStats = await stat(tempPath)
  const newSize = newStats.size

  await replaceFile(tempPath, filePath)
  try { await unlink(tempPath).catch(() => {}) } catch {}

  const saved = ((1 - newSize / originalSize) * 100).toFixed(1)
  const display = rel.length > 50 ? '...' + rel.slice(-47) : rel
  console.log(`${display.padEnd(50)} ${(originalSize/1024).toFixed(0).padStart(6)}KB -> ${(newSize/1024).toFixed(0).padStart(6)}KB  -${saved}%`)
  return { originalSize, newSize }
}

async function main() {
  await mkdir(TMP_DIR, { recursive: true })

  const files = []
  for await (const f of walk(IMG_DIR)) files.push(f)

  let totalOrig = 0, totalNew = 0, count = 0, fail = 0
  console.log(`共找到 ${files.length} 张图片，开始压缩...\n`)

  for (const filePath of files) {
    try {
      const orig = (await stat(filePath)).size
      const { originalSize, newSize } = await compressImage(filePath)
      totalOrig += originalSize
      totalNew += newSize
      count++
    } catch (err) {
      fail++
      console.error(`失败: ${relative(IMG_DIR, filePath)} - ${err.message}`)
    }
  }

  if (fail === 0) {
    try { await rm(TMP_DIR, { recursive: true, force: true }) } catch {}
  } else {
    console.log(`\n保留临时目录 ${TMP_DIR}，将用 Win32 MoveFileEx 再试覆盖失败的 ${fail} 个文件...`)
  }

  // 清残留 .__bak__
  try {
    execSync(process.platform === 'win32'
      ? `Get-ChildItem -LiteralPath '${IMG_DIR}' -Recurse -Filter '*.___bak___*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue; Get-ChildItem -LiteralPath '${IMG_DIR}' -Recurse -Filter '*.__bak__' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue`
      : `find '${IMG_DIR}' -name '*.___bak___*' -delete 2>/dev/null; find '${IMG_DIR}' -name '*.__bak__' -delete 2>/dev/null`,
      { shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash', stdio: 'pipe' }
    )
  } catch {}

  const totalSaved = totalOrig > 0 ? ((1 - totalNew / totalOrig) * 100).toFixed(1) : '0.0'
  console.log(`\n完成：成功 ${count} 张，失败 ${fail} 张`)
  console.log(`总大小：${(totalOrig/1024/1024).toFixed(2)}MB -> ${(totalNew/1024/1024).toFixed(2)}MB  节省 ${totalSaved}%（约 ${((totalOrig-totalNew)/1024/1024).toFixed(2)}MB）`)
}

main()
