/**
 * 头像处理管线：校验 → 居中方形裁切 → 限制边长 → JPEG 重编码压到目标体积。
 * 存 dataURL 而不是 Blob URL：后者刷新即失效。
 */

export const AVATAR_ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']
export const AVATAR_MAX_INPUT_BYTES = 8 * 1024 * 1024
export const AVATAR_MAX_EDGE = 512
const TARGET_BYTES = 120 * 1024

async function encode(bitmap: ImageBitmap, side: number, quality: number): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  // 白底：透明 PNG 直接转 JPEG 会变黑
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, side, side)

  const sx = (bitmap.width - Math.min(bitmap.width, bitmap.height)) / 2
  const sy = (bitmap.height - Math.min(bitmap.width, bitmap.height)) / 2
  const edge = Math.min(bitmap.width, bitmap.height)
  ctx.drawImage(bitmap, sx, sy, edge, edge, 0, 0, side, side)

  return canvas.toDataURL('image/jpeg', quality)
}

export async function processAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const side = Math.min(AVATAR_MAX_EDGE, Math.min(bitmap.width, bitmap.height))
    let dataUrl = await encode(bitmap, side, 0.82)

    if (dataUrl.length * 0.75 > TARGET_BYTES) {
      dataUrl = await encode(bitmap, Math.min(side, 384), 0.72)
    }
    if (dataUrl.length * 0.75 > TARGET_BYTES * 2) {
      dataUrl = await encode(bitmap, Math.min(side, 256), 0.65)
    }
    return dataUrl
  } finally {
    bitmap.close()
  }
}

/** 粗略估算当前数据占用（localStorage 按 UTF-16 计，实际字节数约为字符数 × 2） */
export function estimateBytes(json: string): number {
  return json.length * 2
}
