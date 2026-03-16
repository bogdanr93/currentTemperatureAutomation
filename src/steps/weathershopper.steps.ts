import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { logger } from '../utils/logger'
import type { PWWorld } from '../world'

let category: 'moisturizer' | 'sunscreen' | 'refresh' = 'refresh'

Given('I open the WeatherShopper site', async function (this: PWWorld) {
  const home = new HomePage(this.page)
  await home.goto()
})

When('I decide what to shop based on temperature', async function (this: PWWorld) {
  const home = new HomePage(this.page)
  let temp = await home.getCurrentTemperature()
  category = home.decideShopFor(temp)
  logger.info('Temperature read', { temperature: temp, decision: category })
  
  // The app only offers shopping paths for temperatures < 19 (moisturizers) or > 34 (sunscreens).
  // If we are in between, we refresh the page to get a new temperature reading.
  for (let attempts = 1; category === 'refresh' && attempts <= 30; attempts++) {
    await this.page.reload({ waitUntil: 'domcontentloaded' })
    temp = await home.getCurrentTemperature()
    category = home.decideShopFor(temp)
    logger.info('Refreshed for temperature', { attempt: attempts, temperature: temp, decision: category })
  }
  assert.ok(category === 'moisturizer' || category === 'sunscreen')
})

When('I add two required products to the cart', async function (this: PWWorld) {
  const cat = category === 'moisturizer' ? 'moisturizer' : 'sunscreen'
  const products = new ProductsPage(this.page, cat)
  await products.goto()
  if (cat === 'sunscreen') {
    await products.pickSunscreens()
  } else {
    await products.pickMoisturizers()
  }
})

When('I open the cart and pay', async function (this: PWWorld) {
  const cart = new CartPage(this.page)
  await cart.openViaNav()
  assert.ok(await cart.verifyItemCount(2))
  await cart.clickPayWithCard()
  const checkout = new CheckoutPage(this.page)
  await checkout.fillPaymentAndSubmit()
})

Then('I verify payment result or retry once if failed', async function (this: PWWorld) {
  const checkout = new CheckoutPage(this.page)
  let result = await checkout.assertPaymentResult()
  let retryCount = 0

  while (result === 'failed' && retryCount < 10) {
    retryCount++
    logger.warn('Payment failed, retrying entire flow', { retryCount })
    
    // 1. Home
    const home = new HomePage(this.page)
    await home.goto()
    let temp = await home.getCurrentTemperature()
    category = home.decideShopFor(temp)
    for (let attempts = 1; category === 'refresh' && attempts <= 30; attempts++) {
      await this.page.reload({ waitUntil: 'domcontentloaded' })
      temp = await home.getCurrentTemperature()
      category = home.decideShopFor(temp)
    }
    
    // 2. Products
    const products = new ProductsPage(this.page, category === 'moisturizer' ? 'moisturizer' : 'sunscreen')
    await products.goto()
    if (category === 'sunscreen') {
      await products.pickSunscreens()
    } else {
      await products.pickMoisturizers()
    }
    
    // 3. Cart & Pay
    const cart = new CartPage(this.page)
    await cart.openViaNav()
    assert.ok(await cart.verifyItemCount(2))
    await cart.clickPayWithCard()
    
    // 4. Checkout
    await checkout.fillPaymentAndSubmit()
    result = await checkout.assertPaymentResult()
  }
  assert.strictEqual(result, 'success')
})
