import { setWorldConstructor, Before, After, World, IWorldOptions, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { logger } from './utils/logger'

export interface PWWorld extends World {
  browser: Browser
  context: BrowserContext
  page: Page
  debug?: boolean
}

class CustomWorld {
  attach: any
  parameters: any
  log: any
  link: any
  browser!: Browser
  context!: BrowserContext
  page!: Page
  debug?: boolean

  constructor(options: IWorldOptions) {
    this.attach = options.attach
    this.parameters = options.parameters
    this.log = options.log
    // @ts-ignore
    this.link = (options as any).link
    this.debug = options.parameters?.debug
  }
}

setWorldConstructor(CustomWorld)

setDefaultTimeout(60000)

Before(async function (this: PWWorld) {
  const args = process.argv
  const params: any = (this as any).parameters || {}
  const wantHeadful =
    !!this.debug ||
    params.headful === true ||
    params.headless === false ||
    params.browser === 'headful' ||
    args.includes('--browser=headful') ||
    process.env.HEADFUL === 'true'

  this.browser = await chromium.launch({ headless: !wantHeadful })
  this.context = await this.browser.newContext()
  this.page = await this.context.newPage()
  logger.info('Browser started')
})

After(async function (this: PWWorld) {
  await this.context.close()
  await this.browser.close()
  logger.info('Browser closed')
})
