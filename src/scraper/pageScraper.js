const {detect} = require('./contentShiftDetector')
const {minimizeBrowser, validateFirstURL} = require('./scraperHelpers')
const config = require('../USER_CONFIG.json')
const DETECT_NON_RESTFUL = config['DETECT_NON_RESTFUL']
let DOMAIN

const scraperObject = {
	/**
	 * Scrape a website from the domain
	 * 
	 * @param {Browser} browser 
	 * @param {String} domain 
	 * @param {DatabaseAccessor} databaseAccessor 
	 */
    async scraper(browser, domain, databaseAccessor){
        let [page] = await browser.pages()
		await minimizeBrowser(page)
		DOMAIN = domain
		async function scrapeCurrentPage(outerURL){
			try{
				console.log(`Navigating to ${outerURL}...`)

				// navigate to the selected page
				await page.goto(outerURL)
				await minimizeBrowser(page)
				// wait for content to load
				await page.waitForNetworkIdle()

				// account for redirect links
				const realOuterURL = await page.url()

				if (realOuterURL.match(/#/) !== null){
					return
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
				
				// redirects
				if (outerURL !== realOuterURL){
					let redirectStatus = await databaseAccessor.isURLNewNode(realOuterURL)
					if (redirectStatus){
						await databaseAccessor.addRedirectNode(outerURL, realOuterURL)
					}
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

				// remove same page 'hyper-links'
				urls = urls.map(url => url.replace(/#/,''))

				// remove duplicates
				urls = Array.from(new Set(urls));

				// get rid of www.
				urls = urls.map(url => url.replace(/www\./, ''))

				// check that the domain is correct
				urls = urls.filter(url => url.match(DOMAIN) !== null)

				// make each url a new node...
				for (let url in urls){
					if (await databaseAccessor.isURLNewNode(urls[url])){
						await databaseAccessor.setNewPageNodeFromURL(urls[url], realOuterURL)
					} else {
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
			catch(e){
				console.error(e)
				return
			}
		}
		let firstURL = validateFirstURL(DOMAIN)

		await scrapeCurrentPage(firstURL) 
		await page.close();
    }
}

module.exports = scraperObject