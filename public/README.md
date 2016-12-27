# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Angular Front End for KC
* v0.1

### How do I get set up? ###

* cd into the repo
* npm install
* bower install
* nodemon server.js

### Routing Structure:

* 1.0. /login : For login and registration
* 2.1. /onboarding/setwelcome : [For new users] Set welcome message
* 2.2. /onboarding/addsocial : [For new users] Connect with social media account of a new user, and basic user info
* 2.3. /onboarding/chooseplatform : [For new users] Choose a platform (Optional Screen)
* 2.4. /onboarding/getembedcode : [For new users] Get Embed Code for the website
* 2.5. /onboarding/getfaqs : [For new users] Get FAQs from the user manually, if we cannot find them during the crawl
* 3.0. / : Dashboard front page
* 4.1. /Messages/Inbox : Show all incoming messages and conversations (Rest of the routes on this page are coming soon)
* 4.2. /Messages/Sent : Show all sent messages and conversations 
* 4.3. /Messages/Trash : Show all deleted messages and conversations
* 4.4. /Messages/Drafts : Show all saved messages and conversations 
* 5.1. /Contacts : Show all contacts and leads of a user (Rest of the routes on this page are coming soon)
* 6.1. /KoalaBot/FAQs : Show all the FAQs we have of the user, both manually added and crawled (Rest of the routes on this page are coming soon)
* 7.1. /Apps : Show the static Apps page (Rest of the routes on this page are coming soon)
* 8.1. /GrowthHacks : Show the  GrowthHacks page (Growth hacks will be fetched from a simple rest api)
* 9.1. /Profile : User profile (Rest of the routes on this page are coming soon)