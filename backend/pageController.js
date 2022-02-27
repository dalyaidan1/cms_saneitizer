const pageScraper = require('./pageScraper')
const DatabaseAccessor = require('./databaseAccessor')

// TODO make sure that it does not have a "/" at the end
const domainHome = 'http://books.toscrape.com'

async function scrapeAll(browserInstance, databaseDriver){
	let browser
	try{
		browser = await browserInstance

		const databaseAccessor = new DatabaseAccessor(databaseDriver, domainHome)

		const timeStart = Date.now()
		await pageScraper.scraper(browser, domainHome, databaseAccessor)

		// close puppeteer browser
		await browser.close()

		// close database driver
		databaseDriver.close()

		// see how long it took
		const timeEnd = Date.now()
		console.log(`${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minutes`)
		
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err)
	}
}

module.exports = (browserInstance, driver) => scrapeAll(browserInstance, driver)