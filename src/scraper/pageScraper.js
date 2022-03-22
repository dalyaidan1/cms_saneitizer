const {detect} = require('./contentShiftDetector')
const config = require('../USER_CONFIG.json')
const DETECT_NON_RESTFUL = config['DETECT_NON_RESTFUL']
let DOMAIN

async function minimizeBrowser(page){
	// Create raw protocol session.
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
}

const scraperObject = {
    async scraper(browser, url, databaseAccessor){
        let page = await browser.newPage()
		await minimizeBrowser(page)
		DOMAIN = url
		async function scrapeCurrentPage(outerURL){
			console.log(`Navigating to ${outerURL}...`)

			// navigate to the selected page
			await page.goto(outerURL)
			// wait for content to load
			await page.waitForNetworkIdle()

			// account for redirect links
			const realOuterURL = await page.url()
			if (outerURL !== realOuterURL){
				await databaseAccessor.convertPageNodeToRedirectFromURL(outerURL, realOuterURL)
			}

			// const parentURLKey = url === domainHome ? "/" : removeDomainFromURL(url)
			let outerPageName

			let outerPageStatus = await databaseAccessor.isURLNewNode(realOuterURL)

			//  detect first, so that the base page event can be updated
			if (DETECT_NON_RESTFUL){
				await detect(browser, page, databaseAccessor)
			}

			if (outerPageStatus){
				outerPageName = await databaseAccessor.setNewPageNodeFromPage(page)
			} 
			else {
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

			// check that the domain is correct
			urls = urls.filter(url => url.match(DOMAIN) !== null)

			// make each url a new node...
			for (let url in urls){
				// const innerPageName = databaseAccessor.removeDomainFromURL(url)						
				if (await databaseAccessor.isURLNewNode(urls[url])){
					await databaseAccessor.setNewPageNodeFromURL(urls[url], realOuterURL)
				} else {
					// await databaseAccessor.updatePageNodeOccurrences(urls[url], realOuterURL)
					urls[url] = undefined						
				}
			}

			for(let url in urls){				
				if (urls[url] !== undefined ){
					if (!(await databaseAccessor.pageSanitized(urls[url]))){
						// check that its in the correct domain 
						await scrapeCurrentPage(urls[url])
					}
				}		
			}
			return
		}
		// make sure the first url has a "/" at the end
		if (url.match(/\/$/) === null){
			url = `${url}/`
		}	

		await scrapeCurrentPage(url) 
		await page.close();
    }
}

module.exports = scraperObject