
Feature: Activate
    As a moderator
    I want to be able to activate submitted CSS libraries
    So that I can build a great database of submissions

    Scenario: Activate a library with a valid activation key
        Given the library "https://github.com/rowanmanning/cssdb" has been added
        When I navigate to "/activate?key=test-activation-key"
        Then I should see "success"
        And I should see "true"
        And the library "https://github.com/rowanmanning/cssdb" should be active
