# WeatherShopper Automation

This project is a small, focused end-to-end automation suite for the WeatherShopper application. It uses Playwright with TypeScript and Cucumber to handle the shopping flow from start to finish.

The main idea is to let the current temperature decide what we buy. If it's cold, we go for moisturizers; if it's hot, we grab some sunscreen.

## How it works

The automation follows a simple, human-like workflow:
1. **Check the weather**: We start on the home page and read the temperature.
2. **Make a decision**: 
   - Below 19°C? Time for moisturizers (we'll look for Aloe and Almond).
   - Above 34°C? Sunscreen it is (we'll pick SPF-50 and SPF-30).
   - Just right (19°C - 34°C)? We'll refresh the page until the temperature changes enough to trigger one of the shopping paths.
3. **Shop smart**: Once we're on the products page, we scan all available items and pick the cheapest one that matches what we need.
4. **Checkout**: We head to the cart, verify our items, and handle the Stripe payment pop-up. If the payment fails (which happens sometimes with the test site), the script is smart enough to retry the whole flow.

## Project Layout

- `features/`: The Gherkin scenarios that describe the test in plain English.
- `src/pages/`: Page objects where all the selectors and page-specific logic live.
- `src/steps/`: The actual code that runs for each step in our feature file.
- `src/utils/`: Handy helpers for things like logging and generating test data.

## Getting Started

To run the tests, you'll need to have your dependencies installed (`npm install`).

```bash
# Run in the background (headless)
npm run test:e2e

# Run with the browser visible (headed)
npm run test:e2e:headed
```
