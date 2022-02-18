const pageScraper = require('./pageScraper')

const domainHome = 'http://books.toscrape.com'

async function scrapeAll(browserInstance){
	let browser
	try{
		browser = await browserInstance
		await pageScraper.scraper(browser, domainHome)	
		
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err)
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance)