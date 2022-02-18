const pageScraper = require('./pageScraper')

const domainHome = 'http://books.toscrape.com'

async function scrapeAll(browserInstance){
	let browser
	try{
		browser = await browserInstance
		const timeStart = Date.now()
		await pageScraper.scraper(browser, domainHome)
		await browser.close()
		const timeEnd = Date.now()
		console.log(Math.floor((timeStart - timeEnd) / 1000))
		
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err)
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance)