// const browserObject = require('./scraper/browser')
// const scraperController = require('./appController')
// const driver = require('./database/neo4jDriver')

// //Start the browser and create a browser instance
// let browserInstance = browserObject.startBrowser()

// // Pass the browser instance to the scraper controller
// scraperController(browserInstance, driver)


const sanitize = require('./sanitizer/pageSanitizer')
const {deScapeContent} = require('./generator/generateHelpers')
const fs = require('fs')

const sanitizeThis = fs.readFileSync('public/html/unsane.html', 'utf8').replace(/\\n/g,'')

let sani = sanitize(sanitizeThis, "https://quotes.toscrape.com")

fs.writeFileSync('public/html/sane.html', sani) 

let descsani = deScapeContent(sani)

fs.writeFileSync('public/html/saneScape.html', descsani) 