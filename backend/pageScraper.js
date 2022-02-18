const fs = require('fs')

const pageTracker = {nodes:[]}
let domainHome = ""

async function setNewTrackerNodeFromPage(page){
	const url = await page.url()
	pageTracker[removeDomainFromURL(url)] = {
		"id" : findMaxNodeID()+1,
		"url":url,
		"occurrences": 1,
		"sanitized": false,
		"children": [],
		"title":"",
		"content":await page.$eval('body', content => content.innerHTML),	
	}
	return
}

async function setNewTrackerNodeFromURL(url){
	pageTracker[removeDomainFromURL(url)] = {
		"id" : findMaxNodeID+1,
		"url": url,
		"occurrences": 1,
		"sanitized": false,
		"children": [],
		"title":"",
		"content":"",	
	}
}

// each node in the tracker has an id, find the highest one
const findMaxNodeID = () =>{
	if (pageTracker.nodes.length === 0){
		return 0
	}
	return Math.max(pageTracker.nodes)
}

// regex a url to remove the domain, so key lookup is a tiny bit faster and less cluttered
let removeDomainFromURL = (url) => {
	// console.log(url);
	return url.replace(domainHome, '')
}

// check if a url is already in the tracking oject
const isURLNewNode = (url) => {
	if (removeDomainFromURL(url) in pageTracker){
		return false
	}
	return true
}

const areAllNodesSanitized = () =>{

}

const scraperObject = {
    async scraper(browser, url){
		domainHome = url
        let page = await browser.newPage()
		
		async function scrapeCurrentPage(url){
			console.log(`Navigating to ${url}...`)
			// navigate to the selected page
			await page.goto(url)
			// wait for content to load
			page.waitForNetworkIdle()

			if (isURLNewNode(url)){
				setNewTrackerNodeFromPage(page)
			}
			
			const parentURLKey = removeDomainFromURL(url)

			// make each url a new node...
			// scape all anchors on the page
			let urls = await page.$$eval('a', anchors => {
				// extract the urls from the data
				anchors = anchors.map(
					anchor => {
						const thisUrlKey = removeDomainFromURL(anchor.href)
						
						if (isURLNewNode(anchor.href)){
							setNewTrackerNodeFromURL(anchor.href)
						} else {
							pageTracker[thisUrlKey].occurrences += 1							
						}
						pageTracker[parentURLKey].children.push(pageTracker[thisUrlKey].id)
						return anchor.href
					}
				)
			})

			for(let url in urls){
				return await scrapeCurrentPage(url)
			}
			// if (allUrlsAccountedFor()){
			// 	return true
			// }
			// let nextNode = 
			
			// return scrapeCurrentPage() // Call this function recursively
		}
		await scrapeCurrentPage(url) 
		await page.close();
		// only write to the json when all the links are complete
		fs.writeFileSync('./listOfLinks.json', JSON.stringify(pageTracker))

    }
}

module.exports = scraperObject