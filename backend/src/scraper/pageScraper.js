const {detect} = require('./contentShiftDetector')
const DETECT_NON_RESTFUL = true


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

			let outerPageStatus = await databaseAccessor.isURLNewNode(outerURL)

			//  detect first, so that the base page event can be updated
			if (DETECT_NON_RESTFUL){
				await detect(browser, page, databaseAccessor)
			}

			if (outerPageStatus){
				outerPageName = await databaseAccessor.setNewPageNodeFromPage(page)
			} else {
				outerPageName = await databaseAccessor.updatePageNodeFromPage(page)
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
			for (let url in urls){
				// const innerPageName = databaseAccessor.removeDomainFromURL(url)						
				if (await databaseAccessor.isURLNewNode(urls[url])){
					await databaseAccessor.setNewPageNodeFromURL(urls[url], outerURL)
				} else {
					await databaseAccessor.updatePageNodeOccurrences(urls[url], outerURL)
					url[urls] = undefined						
				}
			}

			for(let url in urls){				
				if (urls[url] !== undefined ){
					if (!(await databaseAccessor.pageSanitized(urls[url]))){			
						await scrapeCurrentPage(urls[url])
					}
				}		
			}

		}
		// make sure the first url has a "/" at the end
		if (url.match(/[^\/]$/) !== "/"){
			url = `${url}/`
		}	

		await scrapeCurrentPage(url) 
		await page.close();
    }
}

module.exports = scraperObject