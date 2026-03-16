Feature: WeatherShopper E2E flow
  Scenario: Shop based on temperature and complete payment
    Given I open the WeatherShopper site
    When I decide what to shop based on temperature
    And I add two required products to the cart
    And I open the cart and pay
    Then I verify payment result or retry once if failed
