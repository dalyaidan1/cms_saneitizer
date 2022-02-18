const fs = require('fs')
const sanitize = require('./pageSanitizer')

const pageTracker = {nodes:[]}
let domainHome = ""

async function setNewTrackerNodeFromPage(page){
	const url = await page.url()
	const newID = findMaxNodeID()+1
	let sanitizedContent = sanitize(
		await page.$eval('body', content => content.innerHTML)
		)
	pageTracker[removeDomainFromURL(url)] = {
		"id" : newID,
		"url":url,
		"occurrences": 1,
		"sanitized": false,
		"children": [],
		"title":"",
		"content":sanitizedContent,	
	}
	pageTracker.nodes.push(newID)
}

async function updateTrackerNodeFromPage(page){
	const url = await page.url()
	const key = removeDomainFromURL(url)
	let sanitizedContent = sanitize(
		await page.$eval('body', content => content.innerHTML)
		)
	pageTracker[key].occurrences +=1
	pageTracker[key].content = sanitizedContent
}

async function setNewTrackerNodeFromURL(url){
	const newID = findMaxNodeID()+1
	pageTracker[removeDomainFromURL(url)] = {
		"id" : newID,
		"url": url,
		"occurrences": 1,
		"sanitized": false,
		"children": [],
		"title":"",
		"content":"",	
	}
	pageTracker.nodes.push(newID)
}

// each node in the tracker has an id, find the highest one
const findMaxNodeID = () =>{
	if (pageTracker.nodes.length === 0){
		return 0
	}
	return Math.max(...pageTracker.nodes)
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
			await page.waitForNetworkIdle()

			const parentURLKey = url === domainHome ? "/" : removeDomainFromURL(url)

			if (isURLNewNode(parentURLKey)){
				setNewTrackerNodeFromPage(page)
			} else {
				updateTrackerNodeFromPage(page)
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
				const thisUrlKey = removeDomainFromURL(url)						
				if (isURLNewNode(url)){
					setNewTrackerNodeFromURL(url)
				} else {
					pageTracker[thisUrlKey].occurrences += 1							
				}
				pageTracker[parentURLKey].children.push(pageTracker[thisUrlKey].id)
			}

			for(let url in urls){
				if (pageTracker[removeDomainFromURL(urls[url])].content.length === 0){
					return await scrapeCurrentPage(urls[url])
				}
				
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