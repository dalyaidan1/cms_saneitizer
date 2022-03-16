const pageScraper = require('./scraper/pageScraper')
const DatabaseAccessor = require('./database/databaseAccessor')
const treeConnector = require('./sanitizer/treeConnector')
const exporter = require('./generator/export')

// TODO make sure that it does not have a "/" at the end
const domainHome = 'http://books.toscrape.com'

async function scrapeAll(browserInstance, databaseDriver){
	let browser
	const timeStart = Date.now()
	try{
		browser = await browserInstance

		const databaseAccessor = await new DatabaseAccessor(databaseDriver, domainHome)

		await pageScraper.scraper(browser, domainHome, databaseAccessor)

		// close puppeteer browser
		await browser.close()


		//clean up page structure for navigation and exporting
		await treeConnector.parseLayers(databaseAccessor)

		await exporter.generateExport(databaseAccessor, true)

		// close database driver
		databaseDriver.close()

		// see how long it took
		const timeEnd = Date.now()
		console.log(`${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minutes`)
		
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err)
		
		databaseDriver.close()

		// see how long it took
		const timeEnd = Date.now()
		console.log(`${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minutes`)
	}
}

module.exports = (browserInstance, driver) => scrapeAll(browserInstance, driver)