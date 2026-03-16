import { Page, Locator } from 'playwright'
import { logger } from '../utils/logger'
import { BasePage } from './BasePage'
import { CONFIG } from '../config'

export type Product = {
  name: string
  price: number
  index: number
}

export class ProductsPage extends BasePage {
  readonly category: 'moisturizer' | 'sunscreen'

  // Element Mapping
  readonly elements = {
    // Each product is contained in a div with class 'text-center' or similar
    productCards: () => this.page.locator('div.text-center.col-4'),
    // Helper to find parts within a card
    productName: (card: Locator) => card.locator('p.font-weight-bold, h4, span').first(),
    addButton: (card: Locator) => card.getByRole('button', { name: /add/i })
  }

  constructor(page: Page, category: 'moisturizer' | 'sunscreen') {
    const path = category === 'moisturizer' ? CONFIG.ENDPOINTS.MOISTURIZER : CONFIG.ENDPOINTS.SUNSCREEN
    super(page, path)
    this.category = category
  }

  /**
   * Efficiently list all actionable products on the page
   */
  async list(): Promise<Product[]> {
    const cards = this.elements.productCards()
    const count = await cards.count()
    const products: Product[] = []

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const nameEl = this.elements.productName(card)
      const addBtn = this.elements.addButton(card)

      if (await addBtn.isVisible()) {
        const name = (await nameEl.textContent())?.trim() || ''
        const text = (await card.textContent()) || ''
        const priceMatch = text.match(/Rs\.?\s*(\d+)/i) || text.match(/Price:\s*(\d+)/i)
        const price = priceMatch ? parseInt(priceMatch[1], 10) : NaN

        if (name && !isNaN(price)) {
          products.push({ name, price, index: i })
        }
      }
    }
    
    logger.info('Listed actionable products', { count: products.length, category: this.category })
    return products
  }

  /**
   * Core logic: find the cheapest product matching a keyword and add it
   */
  async pickAndAddCheapest(keyword: string) {
    let products: Product[] = []
    let filtered: Product[] = []
    const normalizedKeyword = keyword.toLowerCase().replace(/[- ]/g, '')

    for (let attempt = 1; attempt <= 3; attempt++) {
      products = await this.list()
      filtered = products.filter(p => p.name.toLowerCase().replace(/[- ]/g, '').includes(normalizedKeyword))

      if (filtered.length > 0) break
      
      logger.warn(`Keyword "${keyword}" not found. Reloading... (Attempt ${attempt}/3)`)
      await this.page.reload({ waitUntil: 'domcontentloaded' })
    }
    
    if (filtered.length === 0) {
      const available = products.map(p => p.name).join(', ')
      throw new Error(`No product found matching "${keyword}". Available: [${available}]`)
    }

    // Log all products in the filtered group with their prices for verification
    const groupDetails = filtered.map(p => `${p.name} (Rs. ${p.price})`).join(', ')
    logger.info(`Found ${filtered.length} products for keyword "${keyword}": ${groupDetails}`)

    const cheapest = filtered.reduce((min, p) => (p.price < min.price ? p : min), filtered[0])
    logger.info('Selected cheapest matching product', { keyword, name: cheapest.name, price: cheapest.price })
    
    const card = this.elements.productCards().nth(cheapest.index)
    await this.click(this.elements.addButton(card))
  }

  async pickSunscreens() {
    await this.pickAndAddCheapest('SPF-50')
    await this.pickAndAddCheapest('SPF-30')
  }

  async pickMoisturizers() {
    await this.pickAndAddCheapest('Aloe')
    await this.pickAndAddCheapest('Almond')
  }
}
