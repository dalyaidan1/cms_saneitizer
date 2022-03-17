const browserObject = require('./scraper/browser')
const scraperController = require('./appController')
const driver = require('./database/neo4jDriver')

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser()

// Pass the browser instance to the scraper controller
scraperController(browserInstance, driver)