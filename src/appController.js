const pageScraper = require('./scraper/pageScraper')
const DatabaseAccessor = require('./database/databaseAccessor')
const treeConnector = require('./sanitizer/treeConnector')
const exporter = require('./generator/export')
const config = require('./USER_CONFIG.json')
// TODO make sure that it does not have a "/" at the end
const domainHome = config.DOMAIN

async function scrapeAll(browserInstance, databaseDriver, expressApp){
	let browser
	const timeStart = Date.now()
	try{
		browser = await browserInstance

		const databaseAccessor = await new DatabaseAccessor(databaseDriver, domainHome)		

		// await pageScraper.scraper(browser, domainHome, databaseAccessor)
		// let timeEnd = Date.now()
		// console.log(`Scrape Time: ${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minute(s)`)
		// // close puppeteer browser
		// await browser.close()


		// //clean up page structure for navigation and exporting
		// await treeConnector.parseLayers(databaseAccessor)
		// timeEnd = Date.now()
		// console.log(`Connect time: ${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minute(s)`)

		console.log("Exporting")
		await exporter.generateExport(databaseAccessor, true)
		timeEnd = Date.now()
		console.log(`Export time: ${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minute(s)`)

		// close database driver
		databaseDriver.close()

		// see how long it took
		timeEnd = Date.now()
		console.log(`Total time: ${Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)} minute(s)`)
		
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