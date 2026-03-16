import { Page } from 'playwright'
import { logger } from '../utils/logger'
import { BasePage } from './BasePage'
import { CONFIG } from '../config'

export class CartPage extends BasePage {
  // Page-specific elements
  readonly elements = {
    payWithCardButton: () => this.page.getByRole('button', { name: /pay with card/i }),
    // If it's a span inside a button or just a clickable span
    payWithCardSpan: () => this.page.locator('span:has-text("Pay with Card")'),
    cartTableRows: () => this.page.locator('table tbody tr')
  }

  constructor(page: Page) {
    super(page, CONFIG.ENDPOINTS.CART)
  }

  async openViaNav() {
    await this.click(this.commonElements.cartButton())
    await this.page.waitForURL(this.fullUrl)
    logger.info('Opened cart page')
  }

  async verifyItemCount(expected: number): Promise<boolean> {
    const rows = this.elements.cartTableRows()
    const count = await rows.count()
    const isValid = count >= expected
    
    logger.info('Verified cart items', { actual: count, expected, isValid })
    return isValid
  }

  async clickPayWithCard() {
    const btn = this.elements.payWithCardButton()
    const span = this.elements.payWithCardSpan()
    
    // Try standard button first, then fallback to span
    if (await btn.isVisible()) {
      await this.click(btn, { force: true, noWaitAfter: true })
    } else {
      await this.click(span, { force: true, noWaitAfter: true })
    }
    
    logger.info('Clicked Pay with Card')
  }
}
