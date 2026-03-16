import { Page, Locator } from 'playwright'
import { logger } from '../utils/logger'
import { CONFIG } from '../config'

export abstract class BasePage {
  readonly page: Page
  readonly path: string

  // Shared elements across the application
  readonly commonElements = {
    cartButton: () => this.page.getByRole('button', { name: /cart/i }),
    temperature: () => this.page.locator('#temperature')
  }

  constructor(page: Page, path: string) {
    this.page = page
    this.path = path
  }

  get fullUrl(): string {
    return `${CONFIG.BASE_URL}${this.path}`
  }

  async goto() {
    await this.page.goto(this.fullUrl, { waitUntil: 'domcontentloaded' })
    logger.info('Navigated to page', { url: this.fullUrl })
  }

  /**
   * Robust click helper that ensures the element is ready
   */
  protected async click(locator: Locator, options?: Parameters<Locator['click']>[0]) {
    await locator.scrollIntoViewIfNeeded()
    await locator.click({ ...options })
  }

  /**
   * Robust fill helper
   */
  protected async fill(locator: Locator, value: string, options?: Parameters<Locator['fill']>[1]) {
    await locator.waitFor({ state: 'visible' })
    await locator.fill(value, options)
  }

  /**
   * Standardized wait for success message logic
   */
  protected async containsText(text: string | RegExp): Promise<boolean> {
    const bodyText = await this.page.innerText('body')
    return typeof text === 'string' ? bodyText.includes(text) : text.test(bodyText)
  }
}
