import type { ThemeId } from './storyDraw'

export type StoryKind = 'menu' | 'photo' | 'announce'

export type MenuData = {
    kind: StoryKind
    theme: ThemeId
    weekday: string
    dateLabel: string
    items: string
    option: string
    headline: string
    message: string
    cta: string
    phone1: string
    phone2: string
    address: string
}

export const WEEKDAYS = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO',
] as const

const STORAGE_KEY = 'chico-cardapio'

export function weekdayFromDate(date: Date): string {
    return WEEKDAYS[date.getDay()]
}

export function dateLabelFromDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
}

export function isoFromDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

export function parseIsoDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function defaultMenu(): MenuData {
    const today = new Date()
    return {
        kind: 'menu',
        theme: 'chico',
        weekday: weekdayFromDate(today),
        dateLabel: dateLabelFromDate(today),
        items: 'ARROZ/FEIJÃO\nBIFE ACEBOLADO\nBATATA FRITA\nMACARRÃO ALHO E ÓLEO\nSALADA',
        option: 'FILÉ DE FRANGO',
        headline: 'AVISO',
        message: 'HOJE NÃO HAVERÁ ENTREGA.\nFUNCIONAMOS SOMENTE NO SALÃO.',
        cta: 'BATEU A FOME? PEÇA!',
        phone1: '(43) 3067-2443',
        phone2: '(43) 9.9197-8063',
        address: 'CARMO ANTÔNIO SALUM, 357',
    }
}

export function loadMenu(): MenuData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return defaultMenu()
        return { ...defaultMenu(), ...JSON.parse(raw) }
    } catch {
        return defaultMenu()
    }
}

export function saveMenu(data: MenuData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function menuLines(items: string): string[] {
    return items
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
}

export function fileStamp(data: MenuData): string {
    return data.dateLabel.replace('/', '-')
}
