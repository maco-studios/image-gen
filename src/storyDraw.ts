import type { MenuData } from './menu'
import { menuLines } from './menu'
import { drawCover } from './photo'

export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

const ASSETS = {
    bg: assetUrl('layers/layer-bg.png'),
    food: assetUrl('layers/layer-food.png'),
    fire: assetUrl('layers/layer-fire.png'),
    ride: assetUrl('layers/layer-delivery.png'),
    logo: assetUrl('layers/logo-clear.png'),
} as const

type AssetName = keyof typeof ASSETS

const images = new Map<AssetName, HTMLImageElement>()

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Falha ao carregar ${src}`))
        img.src = src
    })
}

export async function prepareStoryAssets() {
    await Promise.all(
        (Object.keys(ASSETS) as AssetName[]).map(async (name) => {
            if (!images.has(name)) images.set(name, await loadImage(ASSETS[name]))
        }),
    )
    await document.fonts.load('900 160px Montserrat')
    await document.fonts.load('800 72px Montserrat')
    await document.fonts.load('900 48px "Font Awesome 7 Free"')
    await document.fonts.load('400 48px "Font Awesome 7 Brands"')
    await document.fonts.load('400 48px Ubuntu')
    await document.fonts.load('500 56px Ubuntu')
    await document.fonts.ready
}

function img(name: AssetName) {
    const asset = images.get(name)
    if (!asset) throw new Error('Assets do Stories ainda não carregaram.')
    return asset
}

export function drawStory(
    ctx: CanvasRenderingContext2D,
    menu: MenuData,
    tx = 0,
    ty = 0,
    hero: CanvasImageSource | null = null,
) {
    const w = STORY_WIDTH
    const h = STORY_HEIGHT
    const shift = (depth: number) => ({
        x: tx * depth,
        y: ty * depth,
    })

    ctx.save()
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#090704'
    ctx.fillRect(0, 0, w, h)

    if (menu.kind !== 'announce') {
        const bg = shift(-10)
        ctx.drawImage(img('bg'), -40 + bg.x, -40 + bg.y, w + 80, h + 80)

        const shade = shift(4)
        const shadeGrad = ctx.createRadialGradient(
            w / 2 + shade.x,
            h * 0.42 + shade.y,
            40,
            w / 2 + shade.x,
            h * 0.42 + shade.y,
            w * 0.72,
        )
        shadeGrad.addColorStop(0, 'rgba(10, 6, 3, 0.12)')
        shadeGrad.addColorStop(1, 'rgba(6, 3, 2, 0.7)')
        ctx.fillStyle = shadeGrad
        ctx.beginPath()
        ctx.roundRect(w * 0.08 + shade.x, h * 0.13 + shade.y, w * 0.84, h * 0.72, 28)
        ctx.fill()
    }

    const copy = shift(3)
    ctx.save()
    ctx.translate(copy.x, copy.y)
    drawCopy(ctx, menu, w, h, hero)
    ctx.restore()

    if (menu.kind === 'menu') {
        const foodLayer = document.createElement('canvas')
        foodLayer.width = w
        foodLayer.height = h
        const foodCtx = foodLayer.getContext('2d')
        if (foodCtx) {
            const food = shift(22)
            foodCtx.drawImage(img('food'), -w * 0.12 + food.x, -h * 0.12 + food.y, w * 1.24, h * 1.24)
            foodCtx.globalCompositeOperation = 'destination-in'
            const keepEdges = foodCtx.createRadialGradient(
                w * 0.5,
                h * 0.46,
                w * 0.16,
                w * 0.5,
                h * 0.46,
                w * 0.48,
            )
            keepEdges.addColorStop(0, 'rgba(0,0,0,0)')
            keepEdges.addColorStop(0.42, 'rgba(0,0,0,0)')
            keepEdges.addColorStop(1, '#000')
            foodCtx.fillStyle = keepEdges
            foodCtx.fillRect(0, 0, w, h)
            ctx.save()
            ctx.globalCompositeOperation = 'lighten'
            ctx.drawImage(foodLayer, 0, 0)
            ctx.restore()
        }
    }

    if (menu.kind !== 'announce') {
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const fire = shift(34)
        ctx.drawImage(img('fire'), -w * 0.1 + fire.x, h * 0.72 + fire.y, w * 1.2, h * 0.32)
        ctx.restore()
    }

    if (menu.kind === 'menu') {
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const ride = shift(30)
        const rideSize = w * 0.26
        ctx.drawImage(
            img('ride'),
            w - rideSize - w * 0.015 + ride.x,
            h - rideSize - h * 0.042 + ride.y,
            rideSize,
            rideSize,
        )
        ctx.restore()
    }

    const logo = shift(10)
    const logoSize = w * 0.2
    const logoX = w / 2 - logoSize / 2 + logo.x
    const logoY = h * 0.028 + logo.y
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img('logo'), logoX - logoSize * 0.09, logoY - logoSize * 0.09, logoSize * 1.18, logoSize * 1.18)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.lineWidth = w * 0.007
    ctx.strokeStyle = '#efc45a'
    ctx.stroke()

    ctx.restore()
}

const FA = {
    calendar: '\uf133',
    utensils: '\uf2e7',
    camera: '\uf030',
    warning: '\uf071',
    star: '\uf005',
    phone: '\uf095',
    whatsapp: '\uf232',
    location: '\uf3c5',
} as const

function font(weight: number, size: number, family: 'Montserrat' | 'Ubuntu') {
    return `${weight} ${size}px ${family}, sans-serif`
}

function faFont(size: number, brands = false) {
    return brands
        ? `400 ${size}px "Font Awesome 7 Brands"`
        : `900 ${size}px "Font Awesome 7 Free"`
}

function textBox(ctx: CanvasRenderingContext2D, text: string, size: number) {
    const metrics = ctx.measureText(text)
    return {
        ascent: metrics.actualBoundingBoxAscent || size * 0.78,
        descent: metrics.actualBoundingBoxDescent || size * 0.22,
        width: metrics.width,
    }
}

function drawIconText(
    ctx: CanvasRenderingContext2D,
    cx: number,
    y: number,
    icon: string,
    label: string,
    textSize: number,
    textFamily: 'Montserrat' | 'Ubuntu',
    textWeight: number,
    color: string,
    brands = false,
) {
    const iconSize = textSize * 0.92
    ctx.font = faFont(iconSize, brands)
    const iconW = ctx.measureText(icon).width
    ctx.font = font(textWeight, textSize, textFamily)
    const textW = ctx.measureText(label).width
    const gap = textSize * 0.35
    let x = cx - (iconW + gap + textW) / 2
    ctx.textAlign = 'left'
    ctx.fillStyle = color
    ctx.font = faFont(iconSize, brands)
    ctx.fillText(icon, x, y)
    x += iconW + gap
    ctx.font = font(textWeight, textSize, textFamily)
    ctx.fillText(label, x, y)
    ctx.textAlign = 'center'
}

function fitTitleSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
) {
  let size = startSize
  ctx.font = font(900, size, 'Montserrat')
  while (size > 28 && ctx.measureText(text).width > maxWidth) {
    size -= 1
    ctx.font = font(900, size, 'Montserrat')
  }
  return size
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const rows: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.trim() ? paragraph.trim().split(/\s+/) : ['']
    let current = ''
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (current && ctx.measureText(next).width > maxWidth) {
        rows.push(current)
        current = word
      } else {
        current = next
      }
    }
    rows.push(current)
  }
  return rows.filter((row, i, all) => row || i < all.length - 1)
}

function dishBlockHeight(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  dishSize: number,
  dishGap: number,
  padY: number,
) {
  if (lines.length === 0) return padY * 2
  ctx.font = font(400, dishSize, 'Ubuntu')
  const body = lines.reduce((sum, line) => {
    const box = textBox(ctx, line.toUpperCase(), dishSize)
    return sum + box.ascent + box.descent
  }, 0)
  return padY * 2 + body + dishGap * Math.max(0, lines.length - 1)
}

function storyCta(menu: MenuData) {
  if (menu.kind === 'announce') return 'FALE CONOSCO'
  return menu.cta.toUpperCase()
}

function footerHeight(
  ctx: CanvasRenderingContext2D,
  menu: MenuData,
  w: number,
  h: number,
  scale: number,
  withOption = true,
) {
  const kickerSize = w * 0.026 * scale
  const optionSize = w * 0.044 * scale
  const ctaSize = w * 0.062 * scale
  const phoneSize = w * 0.048 * scale
  const addressSize = w * 0.022 * scale
  const boxPad = h * 0.02 * scale
  const innerGap = h * 0.012 * scale
  const afterBox = h * 0.028 * scale
  const afterCta = h * 0.022 * scale
  const phoneGap = h * 0.012 * scale
  const beforeAddress = h * 0.024 * scale

  let optionBlock = 0
  if (withOption) {
    ctx.font = font(400, kickerSize, 'Ubuntu')
    const kicker = textBox(ctx, 'Opção do dia', kickerSize)
    ctx.font = font(800, optionSize, 'Montserrat')
    const option = textBox(ctx, menu.option.toUpperCase(), optionSize)
    optionBlock =
      boxPad * 2 + kicker.ascent + kicker.descent + innerGap + option.ascent + option.descent + afterBox
  }

  ctx.font = font(900, ctaSize, 'Montserrat')
  const cta = textBox(ctx, storyCta(menu), ctaSize)
  ctx.font = font(500, phoneSize, 'Ubuntu')
  const phone1 = textBox(ctx, menu.phone1, phoneSize)
  const phone2 = textBox(ctx, menu.phone2, phoneSize)
  ctx.font = font(400, addressSize, 'Ubuntu')
  const address = textBox(ctx, menu.address, addressSize)

  const phoneBox = withOption ? 0 : h * 0.018 * scale * 2

  return (
    optionBlock +
    cta.ascent +
    cta.descent +
    afterCta +
    phoneBox +
    phone1.ascent +
    phone1.descent +
    phoneGap +
    phone2.ascent +
    phone2.descent +
    beforeAddress +
    address.ascent +
    address.descent
  )
}

function drawCopy(
    ctx: CanvasRenderingContext2D,
    menu: MenuData,
    w: number,
    h: number,
    hero: CanvasImageSource | null,
) {
    const logoTop = h * 0.028
    const logoSize = w * 0.2
    const cx = w / 2
    let y = logoTop + logoSize + h * 0.048

    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const photoMode = menu.kind === 'photo'
    const announceMode = menu.kind === 'announce'
    const menuMode = menu.kind === 'menu'
    let photoX = 0
    let photoY = 0
    let photoW = 0
    let photoH = 0
    let photoRadius = 0

    if (photoMode) {
      photoW = w * 0.8
      photoH = h * 0.8
      photoX = (w - photoW) / 2
      photoY = (h - photoH) / 2
      photoRadius = w * 0.028
      ctx.fillStyle = '#120c08'
      ctx.beginPath()
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius)
      ctx.fill()
      if (hero) {
        drawCover(ctx, hero, photoX, photoY, photoW, photoH, photoRadius)
      } else {
        ctx.fillStyle = '#ffc43a'
        ctx.font = faFont(w * 0.08)
        ctx.fillText(FA.camera, cx, photoY + photoH * 0.5)
        ctx.font = font(500, w * 0.032, 'Ubuntu')
        ctx.fillStyle = '#f0d7a4'
        ctx.fillText('TIRE UMA FOTO DO PRATO', cx, photoY + photoH * 0.58)
      }
      ctx.strokeStyle = '#ffc43a'
      ctx.lineWidth = Math.max(2, h * 0.003)
      ctx.beginPath()
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius)
      ctx.stroke()
    }

    const title = photoMode
      ? 'PRATO DO DIA'
      : announceMode
        ? (menu.headline.trim() || 'AVISO').toUpperCase()
        : 'CARDÁPIO DO DIA'
    const stampSize = fitTitleSize(ctx, title, w * 0.86, w * 0.09)
    const daySize = w * 0.036
    const dateSize = w * 0.052
    ctx.font = font(900, stampSize, 'Montserrat')
    let box = textBox(ctx, title, stampSize)
    ctx.font = font(400, daySize, 'Ubuntu')
    const dayBox = textBox(ctx, menu.weekday, daySize)
    ctx.font = font(800, dateSize, 'Montserrat')
    const dateBox = textBox(ctx, menu.dateLabel, dateSize)

    if (photoMode) {
      const textH =
        box.ascent +
        box.descent +
        h * 0.032 +
        dayBox.ascent +
        dayBox.descent +
        h * 0.012 +
        dateBox.ascent +
        dateBox.descent +
        h * 0.05
      const bandH = y + textH - photoY
      const fade = ctx.createLinearGradient(0, photoY, 0, photoY + bandH)
      fade.addColorStop(0, 'rgba(6, 3, 1, 0.88)')
      fade.addColorStop(0.55, 'rgba(6, 3, 1, 0.5)')
      fade.addColorStop(1, 'rgba(6, 3, 1, 0)')
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius)
      ctx.clip()
      ctx.fillStyle = fade
      ctx.fillRect(photoX, photoY, photoW, bandH)
      ctx.restore()
    }

    ctx.fillStyle = '#ffc43a'
    ctx.font = font(900, stampSize, 'Montserrat')
    ctx.shadowColor = photoMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.55)'
    ctx.shadowBlur = photoMode ? h * 0.018 : h * 0.01
    ctx.shadowOffsetY = photoMode ? h * 0.004 : h * 0.003
    y += box.ascent
    if (announceMode) {
      drawIconText(ctx, cx, y, FA.warning, title, stampSize, 'Montserrat', 900, '#ffc43a')
    } else {
      ctx.fillText(title, cx, y)
    }
    y += box.descent + h * 0.032

    ctx.fillStyle = '#f3e6cc'
    ctx.font = font(400, daySize, 'Ubuntu')
    box = dayBox
    y += box.ascent
    ctx.fillText(menu.weekday, cx, y)
    y += box.descent + h * 0.012

    ctx.font = font(800, dateSize, 'Montserrat')
    box = dateBox
    y += box.ascent
    drawIconText(ctx, cx, y, FA.calendar, menu.dateLabel, dateSize, 'Montserrat', 800, '#ffc43a')
    y += box.descent + h * 0.038
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const lines = menuLines(menu.items)
    const listStart = y
    const bottomSafe = h * 0.038
    let dishSize = w * 0.046
    let dishGap = h * 0.018
    let padY = h * 0.02
    const minDish = w * 0.026
    let footerScale = 1
    const afterList = () => h * 0.028 * footerScale

    if (photoMode) {
      const naturalFooter = footerHeight(ctx, menu, w, h, 1, false)
      footerScale = Math.max(0.72, Math.min(1, (h * 0.18) / naturalFooter))
      y = h - bottomSafe - footerHeight(ctx, menu, w, h, footerScale, false)
    } else if (announceMode) {
      const naturalFooter = footerHeight(ctx, menu, w, h, 1, false)
      footerScale = Math.max(0.72, Math.min(1, (h * 0.22) / naturalFooter))
      const footerH = footerHeight(ctx, menu, w, h, footerScale, false)
      const boxW = w * 0.8
      const boxTop = y
      const boxBottom = h - bottomSafe - footerH - h * 0.02
      const boxH = Math.max(h * 0.22, boxBottom - boxTop)
      let msgSize = w * 0.048
      const minMsg = w * 0.028
      const pad = h * 0.028
      const innerW = boxW - pad * 2
      let rows: string[] = []
      let lineGap = h * 0.012
      const fits = () => {
        ctx.font = font(500, msgSize, 'Ubuntu')
        rows = wrapLines(ctx, menu.message.trim() || 'Escreva o aviso.', innerW)
        const heights = rows.map((row) => textBox(ctx, row || ' ', msgSize))
        const body = heights.reduce((sum, item) => sum + item.ascent + item.descent, 0)
        return pad * 2 + body + lineGap * Math.max(0, rows.length - 1) <= boxH
      }
      while (!fits() && msgSize > minMsg) {
        msgSize -= 0.5
        lineGap = Math.max(h * 0.006, lineGap * 0.94)
      }
      ctx.font = font(500, msgSize, 'Ubuntu')
      const heights = rows.map((row) => textBox(ctx, row || ' ', msgSize))
      const body = heights.reduce((sum, item) => sum + item.ascent + item.descent, 0)
      let innerY =
        boxTop + (boxH - (body + lineGap * Math.max(0, rows.length - 1))) / 2
      ctx.fillStyle = '#fff7ea'
      rows.forEach((row, i) => {
        const item = heights[i]
        if (!item) return
        innerY += item.ascent
        ctx.fillText((row || ' ').toUpperCase(), cx, innerY, innerW)
        innerY += item.descent + lineGap
      })
      y = boxTop + boxH + h * 0.028 * footerScale
    } else {
    const listFits = () =>
      dishBlockHeight(ctx, lines, dishSize, dishGap, padY) <=
      h - bottomSafe - footerHeight(ctx, menu, w, h, footerScale) - listStart - afterList()

    while (!listFits() && dishSize > minDish) {
      dishSize -= 0.5
      dishGap = Math.max(h * 0.006, dishGap * 0.94)
      padY = Math.max(h * 0.008, padY * 0.94)
    }

    if (!listFits()) {
      const listH = dishBlockHeight(ctx, lines, dishSize, dishGap, padY)
      const room = h - bottomSafe - listStart - listH - h * 0.016
      const naturalFooter = footerHeight(ctx, menu, w, h, 1)
      footerScale = Math.max(0.68, Math.min(1, room / naturalFooter))
    }

    ctx.font = font(400, dishSize, 'Ubuntu')
    const dishHeights = lines.map((line) => textBox(ctx, line.toUpperCase(), dishSize))
    const blockH = dishBlockHeight(ctx, lines, dishSize, dishGap, padY)
    const blockTop = y
    ctx.strokeStyle = 'rgba(255, 196, 58, 0.55)'
    ctx.lineWidth = Math.max(1, h * 0.0018 * footerScale)
    ctx.beginPath()
    ctx.moveTo(w * 0.16, blockTop)
    ctx.lineTo(w * 0.84, blockTop)
    ctx.moveTo(w * 0.16, blockTop + blockH)
    ctx.lineTo(w * 0.84, blockTop + blockH)
    ctx.stroke()

    y += padY
    lines.forEach((line, i) => {
      if (i > 0) {
        y += dishGap
        ctx.fillStyle = '#ffc43a'
        ctx.textAlign = 'center'
        ctx.font = faFont(Math.max(10, dishSize * 0.38))
        ctx.fillText(FA.utensils, cx, y - dishGap / 2 + dishSize * 0.12)
      }
      const item = dishHeights[i]
      if (!item) return
      y += item.ascent
      ctx.fillStyle = '#fff7ea'
      ctx.font = font(400, dishSize, 'Ubuntu')
      ctx.fillText(line.toUpperCase(), cx, y)
      y += item.descent
    })
    y = blockTop + blockH + afterList()
    }

    const s = footerScale

    if (menuMode) {
      const kickerSize = w * 0.026 * s
      const optionSize = w * 0.044 * s
      ctx.font = font(400, kickerSize, 'Ubuntu')
      const kicker = textBox(ctx, 'Opção do dia', kickerSize)
      ctx.font = font(800, optionSize, 'Montserrat')
      const option = textBox(ctx, menu.option.toUpperCase(), optionSize)
      const boxPad = h * 0.02 * s
      const innerGap = h * 0.012 * s
      const boxH = boxPad * 2 + kicker.ascent + kicker.descent + innerGap + option.ascent + option.descent
      const boxW = w * 0.78
      ctx.strokeStyle = '#ffc43a'
      ctx.lineWidth = Math.max(1, h * 0.0022 * s)
      ctx.strokeRect(cx - boxW / 2, y, boxW, boxH)

      let inner = y + boxPad
      inner += kicker.ascent
      drawIconText(ctx, cx, inner, FA.star, 'Opção do dia', kickerSize, 'Ubuntu', 400, '#ffcf6a')
      inner += kicker.descent + innerGap + option.ascent
      ctx.fillStyle = '#fff7ea'
      ctx.font = font(800, optionSize, 'Montserrat')
      ctx.fillText(menu.option.toUpperCase(), cx, inner)
      y += boxH + h * 0.028 * s
    }

    const ctaSize = w * 0.062 * s
    ctx.fillStyle = '#ffc43a'
    ctx.font = font(900, ctaSize, 'Montserrat')
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = h * 0.01 * s
    ctx.shadowOffsetY = h * 0.005 * s
    box = textBox(ctx, storyCta(menu), ctaSize)
    y += box.ascent
    ctx.fillText(storyCta(menu), cx, y, w * 0.86)
    y += box.descent + h * 0.022 * s
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    const phoneSize = w * 0.048 * s
    ctx.font = font(500, phoneSize, 'Ubuntu')
    const phone1Box = textBox(ctx, menu.phone1, phoneSize)
    const phone2Box = textBox(ctx, menu.phone2, phoneSize)
    const phoneGap = h * 0.012 * s

    if (photoMode || announceMode) {
      const padY = h * 0.014 * s
      const boxW = photoMode ? photoW * 0.8 : w * 0.8
      const boxH = padY * 2 + phone1Box.ascent + phone1Box.descent + phoneGap + phone2Box.ascent + phone2Box.descent
      const boxX = cx - boxW / 2
      const boxTop = y
      ctx.fillStyle = '#080501'
      ctx.strokeStyle = '#ffc43a'
      ctx.lineWidth = Math.max(2, h * 0.0024 * s)
      ctx.beginPath()
      ctx.roundRect(boxX, boxTop, boxW, boxH, w * 0.018)
      ctx.fill()
      ctx.stroke()
      y = boxTop + padY
    }

    box = phone1Box
    y += box.ascent
    drawIconText(ctx, cx, y, FA.phone, menu.phone1, phoneSize, 'Ubuntu', 500, '#fff7ea')
    y += box.descent + phoneGap
    box = phone2Box
    y += box.ascent
    drawIconText(ctx, cx, y, FA.whatsapp, menu.phone2, phoneSize, 'Ubuntu', 500, '#fff7ea', true)
    y += box.descent + (photoMode || announceMode ? h * 0.014 * s : 0) + h * 0.024 * s

    const addressSize = w * 0.022 * s
    ctx.font = font(400, addressSize, 'Ubuntu')
    box = textBox(ctx, menu.address, addressSize)
    y += box.ascent
    if (y + box.descent > h - bottomSafe) {
      y = h - bottomSafe - box.descent
    }
    drawIconText(ctx, cx, y, FA.location, menu.address, addressSize, 'Ubuntu', 400, '#f0d7a4')
}
