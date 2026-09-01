const MAX_EDGE = 2048

function sourceSize(image: CanvasImageSource) {
    if (image instanceof HTMLImageElement) {
        return { width: image.naturalWidth, height: image.naturalHeight }
    }
    if (image instanceof HTMLVideoElement) {
        return { width: image.videoWidth, height: image.videoHeight }
    }
    if (image instanceof HTMLCanvasElement || image instanceof OffscreenCanvas || image instanceof ImageBitmap) {
        return { width: image.width, height: image.height }
    }
    if ('displayWidth' in image) {
        return { width: image.displayWidth, height: image.displayHeight }
    }
    return { width: 0, height: 0 }
}

export function drawCover(
    ctx: CanvasRenderingContext2D,
    image: CanvasImageSource,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    const { width: iw, height: ih } = sourceSize(image)
    if (!iw || !ih) return
    const scale = Math.max(width / iw, height / ih)
    const dw = iw * scale
    const dh = ih * scale
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.clip()
    ctx.drawImage(image, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh)
    ctx.restore()
}

export async function photoFromFile(file: File) {
    let bitmap: ImageBitmap
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
        bitmap = await createImageBitmap(file)
    }
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        bitmap.close()
        throw new Error('Não foi possível preparar a foto.')
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas
}
