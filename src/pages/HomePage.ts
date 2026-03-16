import { Page } from 'playwright'
import { logger } from '../utils/logger'
import { BasePage } from './BasePage'
import { CONFIG } from '../config'

export class HomePage extends BasePage {
  readonly elements = {
    moisturizersButton: () => this.page.getByRole('button', { name: /moisturizers/i }),
    sunscreensButton: () => this.page.getByRole('button', { name: /sunscreens/i }),
    // If buttons are links styled as buttons, fallback to link role
    moisturizersLink: () => this.page.getByRole('link', { name: /moisturizers/i }),
    sunscreensLink: () => this.page.getByRole('link', { name: /sunscreens/i })
  }

  constructor(page: Page) {
    super(page, CONFIG.ENDPOINTS.HOME)
  }

  async getCurrentTemperature(): Promise<number | null> {
    const tempElement = this.commonElements.temperature()
    const text = await tempElement.textContent()
    
    if (!text) {
      logger.warn('Temperature not found on page')
      return null
    }

    const match = text.match(/(-?\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  async shopForMoisturizers() {
    const btn = this.elements.moisturizersButton()
    const link = this.elements.moisturizersLink()
    
    if (await btn.isVisible()) {
      await this.click(btn)
    } else {
      await this.click(link)
    }
  }

  async shopForSunscreens() {
    const btn = this.elements.sunscreensButton()
    const link = this.elements.sunscreensLink()
    
    if (await btn.isVisible()) {
      await this.click(btn)
    } else {
      await this.click(link)
    }
  }

  decideShopFor(temp: number | null): 'moisturizer' | 'sunscreen' | 'refresh' {
    if (temp === null) return 'refresh'
    
    // The application only shows Moisturizers when temp < 19 and Sunscreens when temp > 34.
    // If the temperature is between 19 and 34, we need to refresh the page until we get 
    // a temperature that allows us to proceed with one of the shopping categories.
    if (temp < 19) return 'moisturizer'
    if (temp > 34) return 'sunscreen'
    
    return 'refresh'
  }
}
