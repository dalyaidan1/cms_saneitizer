const pageScraper = require('./scraper/pageScraper')
const DatabaseAccessor = require('./database/databaseAccessor')
const treeConnector = require('./sanitizer/treeConnector')
const exporter = require('./generator/export')
const config = require('./USER_CONFIG.json')
// TODO make sure that it does not have a "/" at the end
const domainHome = config.DOMAIN

async function scrapeAll(browserInstance, databaseDriver){
	let browser
	const timeStart = Date.now()
	try{
		browser = await browserInstance

		const databaseAccessor = await new DatabaseAccessor(databaseDriver, domainHome)		

		const scrapeTimeStart = Date.now()
		await pageScraper.scraper(browser, domainHome, databaseAccessor)
		let timeEnd = Date.now()
		console.log(`Scrape Time: ${calcTime(scrapeTimeStart, timeEnd)} minute(s)`)
		
		// close puppeteer browser
		await browser.close()

		await connect(databaseAccessor)

		// close database driver
		// databaseDriver.close()

		// see how long it took
		timeEnd = Date.now()
		console.log(`Total scrape and connect time: ${calcTime(timeStart, timeEnd)} minute(s)`)
		
	}
	catch(err){
		console.log(err)
		
		databaseDriver.close()

		// see how long it took
		const timeEnd = Date.now()
		console.log(`Error time: ${calcTime(timeStart, timeEnd)} minutes`)
	}
	return true
}

async function connect(databaseAccessor){
	const connectTimeStart = Date.now()
	try{
		//clean up page structure for navigation and exporting
		await treeConnector.parseLayers(databaseAccessor)
		timeEnd = Date.now()
		console.log(`Connect time: ${calcTime(connectTimeStart, timeEnd)} minute(s)`)
	}
	catch(err){
		timeEnd = Date.now()
		console.log(err)
		console.log(`Connect error time: ${calcTime(connectTimeStart, timeEnd)} minute(s)`)
		// close database driver
		databaseDriver.close()
	}

}


async function exportHTML(databaseDriver, filesToo, forAdjustments){
	const exportTimeStart = Date.now()
	const databaseAccessor = new DatabaseAccessor(databaseDriver, domainHome)

	try {		
		console.log("Exporting")
		await exporter.generateExport(databaseAccessor, filesToo, forAdjustments)
		timeEnd = Date.now()
		console.log(`Export time: ${calcTime(exportTimeStart, timeEnd)} minute(s)`)
		// databaseDriver.close()
	}
	catch(err){
		timeEnd = Date.now()
		console.log(err)
		console.log(`Export error time: ${calcTime(exportTimeStart, timeEnd)} minute(s)`)
		databaseDriver.close()
	}
}

function calcTime(timeStart, timeEnd){
	return Math.abs(Math.floor((timeStart - timeEnd) / 1000)/60)
}


module.exports = {
	scrapeAll,
	exportHTML
}