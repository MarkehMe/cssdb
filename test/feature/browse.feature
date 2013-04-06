
Feature: Browse
    As a user
    I want to be able to browse CSS libraries
    So that I can discover useful new tools

    Scenario: Browse popular libraries
        Given I am on the home page
        Then I should see "Popular" in a heading
        # Unfinished – check for libraries in popularity order

    Scenario: Browse recently added libraries
        Given I am on the recently added libraries page
        Then I should see "Recently Added" in a heading
        # Unfinished – check for libraries in added order
