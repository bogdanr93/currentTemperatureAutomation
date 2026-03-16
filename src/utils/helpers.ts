export function parsePrice(text: string): number {
  const m = text.match(/Rs\.?\s*(\d+)/i) || text.match(/Price:\s*Rs\.?\s*(\d+)/i) || text.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : NaN
}

export function nowEmail(): string {
  const d = new Date()
  const token = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}${d.getSeconds().toString().padStart(2, '0')}`
  return `r.bogdan93+${token}@yahoo.com`
}

export function futureExpMMYY(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const yy = (d.getFullYear() % 100).toString().padStart(2, '0')
  return `${mm}/${yy}`
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomCVC(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}

export function randomZipCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString()
}
