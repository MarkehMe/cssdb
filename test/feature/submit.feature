
Feature: Submit
    As a user
    I want to be able to submit my CSS libraries to the site
    So that I can gain exposure for it and help out other designers/developers

    Scenario: View the submission page
        Given I am on the submit page
        Then I should see "Submit" in a heading

    Scenario: Submit a valid library
        Given I am on the submit page
        When I submit the submission form with "https://github.com/rowanmanning/cssdb"
        Then I should see "Thanks"
        And I should see "rowanmanning/cssdb"
        And the library "https://github.com/rowanmanning/cssdb" should be added
        And the library "https://github.com/rowanmanning/cssdb" should be inactive

    Scenario: Submit a library which has already been added
        Given I am on the submit page
        And the library "https://github.com/rowanmanning/cssdb" has been added
        When I submit the submission form with "https://github.com/rowanmanning/cssdb"
        Then I should see "the library you entered has already been submitted"

    Scenario: Submit a nonexistant library
        Given I am on the submit page
        When I submit the submission form with "https://github.com/rowanmanning/not-a-real-repo"
        Then I should see "couldn't find the github repository for your library"
        And the library "https://github.com/rowanmanning/not-a-real-repo" should not be added

    Scenario: Submit a non-GitHub library
        Given I am on the submit page
        When I submit the submission form with "http://cssdb.co/"
        Then I should see "please enter a valid github repository url"
        And the library "http://cssdb.co/" should not be added
