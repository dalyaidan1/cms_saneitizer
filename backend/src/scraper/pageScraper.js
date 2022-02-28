const fs = require('fs')

// function setOuterPage()

const scraperObject = {
    async scraper(browser, url, databaseAccessor){
        let page = await browser.newPage()
		
		async function scrapeCurrentPage(outerURL){
			console.log(`Navigating to ${outerURL}...`)
			// navigate to the selected page
			await page.goto(outerURL)
			// wait for content to load
			await page.waitForNetworkIdle()

			// const parentURLKey = url === domainHome ? "/" : removeDomainFromURL(url)
			let outerPageName

			const outerPageStatus = await databaseAccessor.isURLNewNode(outerURL)

			if (outerPageStatus){
				outerPageName = await databaseAccessor.setNewTrackerNodeFromPage(page)
			} else {
				outerPageName = await databaseAccessor.updateTrackerNodeFromPage(page)
			}			
			
			// scape all anchors on the page
			let urls = await page.$$eval('a', anchors => {
				// set the return array that will be scraped on this recursion
				anchors = anchors.map(
					anchor => {
						return anchor.href
					}
				)
				return anchors
			})

			// remove duplicates
			urls = Array.from(new Set(urls));

			// make each url a new node...
			for (let url of urls){
				// const innerPageName = databaseAccessor.removeDomainFromURL(url)						
				if (await databaseAccessor.isURLNewNode(url)){
					await databaseAccessor.setNewTrackerNodeFromURL(url, outerURL)
				} else {
					await databaseAccessor.updateTrackerNodeOccurrences(url, outerURL)							
				}
			}

			for(let url in urls){
				// console.log(`${urls[url]} again`);
				if (!(await databaseAccessor.pageSanitized(urls[url]))){				
					return await scrapeCurrentPage(urls[url])
				}
				
			}

		}
		// make sure the first url has a "/" at the end
		if (url.match(/[^\/]$/) !== "/"){
			url = `${url}/`
		}	

		await scrapeCurrentPage(url) 
		await page.close();
		// only write to the json when all the links are complete
		// fs.writeFileSync('./listOfLinks.json', JSON.stringify(pageTracker))

    }
}

module.exports = scraperObject