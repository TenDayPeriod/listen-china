// 仅执行覆盖：把 public/.img-tmp/* 的压缩结果覆盖到 public/img/*
// 用于压缩阶段文件锁失败后的二次尝试
import { readdir, stat, unlink, rename } from 'fs/promises'
import { join, relative } from 'path'
import { execSync } from 'child_process'

const TMP_DIR = 'public/.img-tmp'
const IMG_DIR = 'public/img'

async function* walk(dir, base) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) yield* walk(full, base)
    else yield full
  }
}

async function applyOne(tempPath, targetPath) {
  const bakPath = targetPath + '.__bak__'
  try {
    // 策略 0: Node fs.rename（只改目录项）
    try { await rename(targetPath, bakPath) } catch {}
    await rename(tempPath, targetPath)
    try { await unlink(bakPath) } catch {}
    return true
  } catch (e) { /* fallthrough */ }

  const cmdEsc = s => s.replace(/"/g, '""')
  try {
    execSync(
      `cmd /c move /Y "${cmdEsc(targetPath)}" "${cmdEsc(bakPath)}" 2>nul & cmd /c move /Y "${cmdEsc(tempPath)}" "${cmdEsc(targetPath)}" & cmd /c del /F /Q "${cmdEsc(bakPath)}" 2>nul`,
      { stdio: 'pipe' }
    )
    return true
  } catch (e) { /* fallthrough */ }

  const psEsc = s => s.replace(/'/g, "''").replace(/\$/g, '`$')
  try {
    execSync(
      `Rename-Item -LiteralPath '${psEsc(targetPath)}' -NewName '${psEsc(bakPath)}' -Force -ErrorAction SilentlyContinue; ` +
      `Rename-Item -LiteralPath '${psEsc(tempPath)}' -NewName '${psEsc(targetPath)}' -Force; ` +
      `Remove-Item -LiteralPath '${psEsc(bakPath)}' -Force -ErrorAction SilentlyContinue`,
      { shell: 'powershell.exe', stdio: 'pipe' }
    )
    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

async function main() {
  const temps = []
  try { for await (const f of walk(TMP_DIR, TMP_DIR)) temps.push(f) } catch { console.log('无临时目录'); return }
  console.log(`找到 ${temps.length} 个临时压缩结果\n`)

  let ok = 0, fail = 0
  for (const tempPath of temps) {
    const rel = relative(TMP_DIR, tempPath)
    const target = join(IMG_DIR, rel)
    const tmpSize = (await stat(tempPath)).size
    const origSize = (await stat(target)).size
    try {
      await applyOne(tempPath, target)
      const saved = ((1 - tmpSize / origSize) * 100).toFixed(1)
      console.log(`OK  ${rel.padEnd(55)} ${(origSize/1024).toFixed(0).padStart(6)}KB -> ${(tmpSize/1024).toFixed(0).padStart(6)}KB  -${saved}%`)
      ok++
    } catch (e) {
      console.log(`FAIL ${rel}: ${e.message.split('\n')[0]}`)
      fail++
    }
  }
  console.log(`\n成功 ${ok}，失败 ${fail}`)
}
main()
