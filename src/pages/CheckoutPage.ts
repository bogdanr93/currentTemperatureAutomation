import { Page, Frame, Locator } from 'playwright'
import { logger } from '../utils/logger'
import { nowEmail, futureExpMMYY, delay, randomCVC, randomZipCode } from '../utils/helpers'
import { BasePage } from './BasePage'

export class CheckoutPage extends BasePage {
  // Element Mapping (scoped to Stripe frame)
  readonly elements = {
    email: (f: Frame) => f.getByPlaceholder(/email/i),
    cardNumber: (f: Frame) => f.getByPlaceholder(/card number/i),
    expiry: (f: Frame) => f.getByPlaceholder(/mm \/ yy/i),
    cvc: (f: Frame) => f.getByPlaceholder(/cvc/i),
    zip: (f: Frame) => f.getByPlaceholder(/zip code/i),
    submitButton: (f: Frame) => f.getByRole('button', { name: /pay/i }),
    // Fallbacks for non-standard elements
    tickSpan: (f: Frame) => f.locator('span.iconTick'),
    innerPaySpan: (f: Frame) => f.locator('xpath=//*[@id="submitButton"]/span/span')
  }

  constructor(page: Page) {
    super(page, '') // Checkout is triggered by action on Cart
  }

  private async findStripeFrame(): Promise<Frame | null> {
    for (let i = 0; i < 40; i++) {
      const frames = this.page.frames()
      for (const f of frames) {
        try {
          // Check for any of our key inputs in the frame
          if (await f.getByPlaceholder(/email/i).count()) return f
          if ((f.url() || '').includes('stripe')) return f
        } catch {}
      }
      await delay(250) // Stripe iframe takes a moment to be injected into the DOM after the button click
    }
    return null
  }

  async fillPaymentAndSubmit() {
    const frame = await this.findStripeFrame()
    if (!frame) throw new Error('Stripe frame not found')
    
    const data = {
      email: nowEmail(),
      exp: futureExpMMYY(),
      cardNumber: '4111111111111111',
      cvc: randomCVC(),
      zip: randomZipCode()
    }

    logger.info('Entering payment details', { ...data, cardNumber: '****' })

    await this.fill(this.elements.email(frame), data.email)
    await this.fill(this.elements.cardNumber(frame), data.cardNumber)
    await this.fill(this.elements.expiry(frame), data.exp)
    await this.fill(this.elements.cvc(frame), data.cvc)
    
    const zipLoc = this.elements.zip(frame)
    if (await zipLoc.isVisible()) {
      await this.fill(zipLoc, data.zip)
    }

    logger.info('Filled payment details')

    const submit = this.elements.submitButton(frame)
    const tick = this.elements.tickSpan(frame)
    const innerSpan = this.elements.innerPaySpan(frame)

    // Multi-strategy click for the "Pay" button
    if (await submit.isEnabled()) {
      await this.click(submit, { force: true, noWaitAfter: true })
    } else if (await tick.isVisible()) {
      await this.click(tick, { force: true, noWaitAfter: true })
    } else if (await innerSpan.isVisible()) {
      await this.click(innerSpan, { force: true, noWaitAfter: true })
    } else {
      // Final fallback: DOM evaluation
      await frame.evaluate(() => {
        const btn = (document.querySelector('button[type="submit"]') || document.getElementById('submitButton')) as HTMLButtonElement | null
        if (btn) {
          btn.disabled = false
          btn.click()
          btn.closest('form')?.requestSubmit?.()
        }
      })
    }
    
    logger.info('Submitted payment')
  }

  async assertPaymentResult(): Promise<'success' | 'failed'> {
    try {
      // Wait for the success header
      await this.page.waitForSelector('h2:has-text("PAYMENT SUCCESS")', { timeout: 10000 })
      
      const isSuccess = await this.containsText(/your payment was successful/i)
      if (isSuccess) {
        logger.info('Payment confirmed')
        return 'success'
      }
    } catch {
      logger.warn('Payment success message not found')
    }
    return 'failed'
  }
}
