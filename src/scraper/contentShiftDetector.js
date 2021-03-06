const fs = require('fs')
const USER_CONFIG = JSON.parse(fs.readFileSync('./src/USER_CONFIG.json'))
const PROPS_TO_CHECK = USER_CONFIG["ATTRIBUTES"]
const IGNORABLE_ELEMENTS = USER_CONFIG["IGNORABLE_ELEMENTS"]
const TOLERANCE = USER_CONFIG["TOLERANCE"]
const RADIUS = USER_CONFIG["RADIUS"]
const WAIT_TIME = USER_CONFIG["WAIT_TIME"]
let browser
const {minimizeBrowser} = require('./scraperHelpers')
const {getTitle} = require('../database/databaseHelpers')

/**
 * Detect non-RESTful content on a page
 *  
 * @param {Browser} b puppeteer browser object
 * @param {Page} page puppeteer page object
 * @param {DatabaseAccessor} databaseAccessor object giving access to database transactions
 */
async function detect(b, page, databaseAccessor){
    // set browser
    browser = b
    
    // second page for comparisons
    let page2 = await newPage(page)

    // assign all element the page ids, through the dataset prop
    await assignPageIDs(page)
    await assignPageIDs(page2)

    // get all the listeners in the page
    const nodes = await detectEventElements(page2)

    let elementIDsAndEventsToBeChanged = []

    // loop through all the nodes with listeners
    for (let node of nodes){
        if (checkValidElement(node.element.tag)){
            let eventsToCheck = await getValidEvents(node)
            if (eventsToCheck.length > 0){
                for (let event of eventsToCheck){
                    let elementHandleWithListener = await getElementHandle(page2, node.element)
                    await performEvent(elementHandleWithListener, event)
                    // check the changes
                    // if change good, make new page
                    // TODO: properly give options for title                    
                    if (await pagesDifferent(page, page2, node)){
                        // send 
                        let oldTitle = await page2.title()
                        let oldURL = await page2.url()
                        
                        // get rid of ending slash
                        let procURL = oldURL.replace(/\/$/, '')

                        // get rid of a .<ext> in a file, unless a top level page (eg. abc.com/blah)
                        if (procURL.match(/\.com$/) === null){
                            procURL = procURL.replace(/\.[a-zA-Z0-9]*$/, '')
                        }
                        

                        let newTitle = `${await getTitle(page)} - ${event}-${node.element.dataId}`                        
                        let newURL = `${procURL}_page${node.element.dataId}-${event}-${Math.floor(Math.random() * 100000)}_`
                        // check if this is new
                        const subPageNew = await databaseAccessor.isURLNewNode(newURL)
                        if (subPageNew){
                            // set the new page
                            await databaseAccessor.setNewPageNodeFromPage(page2, {
                                url:newURL,
                                title:newTitle,
                                shift_page:false,
                                pre_shift_url: oldURL,
                            })
                            elementIDsAndEventsToBeChanged.push(
                                {
                                    dataId:node.element.dataId,
                                    events:node.events,
                                    goTo:newURL
                                }
                            )
                        }
                    }
                    // reload page 2
                    await reloadPage(page2)
                }
            }
        }
    }
    await updateBasePageEvents(page, elementIDsAndEventsToBeChanged)
    await page2.close()
}

/**
 * Update the location event changes on a page
 * 
 * @param {Page} page puppeteer page object to update
 * @param {Array} elementIDsAndEventsToBeChanged list of elements and events to use
 */
async function updateBasePageEvents(page, elementIDsAndEventsToBeChanged){
    await page.evaluate((elementIDsAndEventsToBeChanged) => {
        for (node of elementIDsAndEventsToBeChanged){
            let elementToChangeEvent = document.querySelector(`[data-cms-saneitizer="${node.dataId}"]`)
            for (let subEvent of node.events){
                elementToChangeEvent.setAttribute(`on${subEvent["type"]}`, `window.location.href='${node.goTo}'`)
            }
        }

    }, elementIDsAndEventsToBeChanged)
}

/**
 * Check a page for any events
 * 
 * @param {Page} page puppeteer page object to update
 * @returns array of elements and events to check
 */
async function detectEventElements(page){
    const client = await page.target().createCDPSession()  

    async function getListener(objType){
        const {result} = await client
            .send('Runtime.evaluate', {expression: objType})
        const {listeners} = await client
            .send('DOMDebugger.getEventListeners', {objectId: result.objectId})
        return listeners
    }

    let elements = await page.$$('*')
    
    let listeners = []

    for (let element in elements){
        let event = await getListener(`document.querySelectorAll('*')[${element}]`)
        let dataId = await page.evaluate((element) => {
            return [...document.querySelectorAll(`[data-cms-saneitizer="${element}"]`)]
                .map(el =>
                    ({
                        "dataId": el.dataset.cmsSaneitizer, 
                        "tag": el.tagName,
                        "attributes": ((attrs) => {
                            let rtAttrs = []
                            for (let attr = 0; attr < attrs.length; attr++) { 
                                rtAttrs.push({
                                    "name": attrs.item(attr).name,
                                    "value": attrs.item(attr).value,
                                })
                            }
                            return rtAttrs
                        })(el.attributes),
                    })
                )
            }, element)
        if (Object.keys(event).length > 0) {
            listeners.push({
                    "events":event, 
                    "element":dataId[0]
                })
        }
    }
    return listeners
}

/**
 * Assign unique numbers in a dataset attribute to all elements on the page
 * 
 * @param {Page} page puppeteer page object to update
 */
async function assignPageIDs(page){
    const injectScript = `(() => { 
        \nconst allTags = document.getElementsByTagName("*")
        \n for (let tag in allTags){ 
            \nallTags[tag].setAttribute("data-cms-saneitizer", tag)}})()`

    await page.addScriptTag({content:injectScript, type:"text/javascript"})
}

/**
 * Get the puppeteer ElementHandle Object for an element in the page
 * 
 * @param {Page} page puppeteer page object to update
 * @param {Object} element element object from list of elements and events
 * @returns 
 */
async function getElementHandle(page, element){
    return await page.$(`[data-cms-saneitizer="${element.dataId}"]`)
}

/**
 * Check that the element is not in ignored elements.
 * follows format rules of:
 * https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_tagname2
 * 
 * @param {String} element TAG NAME of element
 * @returns true or false
 */  
const checkValidElement = async (element) => {
    // TODO: make sure IGN_ELEM 
    if (IGNORABLE_ELEMENTS.includes(element)){
        return false
    }
    return true
}

/**
 * Check that the event is not in ignored events of the element
 * 
 * @param {Object} node element and event object
 * @returns true events 
 */
const getValidEvents = async (node) => {
    let validEvents = [...new Set(
        node.events.map(event => event.type)
    )]
    for (let event in node.events){
        let eventToCheck = node.events[event].type

        // if this event should be checked, according to the user
        if ( (PROPS_TO_CHECK[eventToCheck] !== undefined)
            && (PROPS_TO_CHECK[eventToCheck].check === true)){

            // get all the attribute names that should be ignored in the node being checked
            let matchingAttributeNames = PROPS_TO_CHECK[eventToCheck].ignoreWhenContaining
                                            .map(attribute => attribute.name)
                                            .filter(attributeName => node.element.attributes
                                                            .map(attribute => attribute.name)
                                                            .includes(attributeName))

            // loop through all the attributes that should be ignored
            for (let attribute of PROPS_TO_CHECK[eventToCheck].ignoreWhenContaining){
                // if the attribute appears in the possibility of being ignored
                if (matchingAttributeNames.includes(attribute.name)){
                    // if the value is blank, it will always be valid to ignore
                    if (attribute.value === ''){
                        validEvents = validEvents.filter(event => event !== eventToCheck)
                    }
                    // check the attributes on node being checked
                    for (let currentNodeAttribute of node.element.attribute){
                        // if the nodes attributes match a case that should be ignored
                        if (currentNodeAttribute.name === attribute.name 
                            && currentNodeAttribute.value === attribute.value ){
                                // remove them from being valid
                                validEvents = validEvents.filter(event => event !== eventToCheck)
                        }
                    }
                }
            }
        } else {
            validEvents = validEvents.filter(event => event !== eventToCheck)
        }
    }
    
    return validEvents
}

/**
 * Test if two pages are different enough to justify a new page
 * 
 * @param {Page} originalPage puppeteer page object of origin
 * @param {Page} eventPage puppeteer page object to test events
 * @param {Object} rootElement element with the event
 * @param {Number} tolerance when an event is initiated, how many elements (ancestors) changing qualifies a new page
 * @param {Number} radius when an event is initiated, how many elements away (ancestors) should be checked
 * @returns true or false
 */
async function pagesDifferent(originalPage, eventPage, rootElement, tolerance=TOLERANCE, radius=RADIUS){

    async function checkNodes(originalPage, eventPage, rootElementID, tolerance, radius){
        async function getCompareNode(page, rootElementID){
            return await page.evaluate((rootElementID) => {
                let root = document.querySelector(`[data-cms-saneitizer="${rootElementID}"]`)        
                return {
                    html:root.innerHTML,
                }
            }, rootElementID)
        }
        // eval p1 node
        let originalPageCompareNode = await getCompareNode(originalPage, rootElementID)
        // eval p2 node
        let eventPageCompareNode = await getCompareNode(eventPage, rootElementID)
        // if innerHTML diff
        if (originalPageCompareNode["html"] !== eventPageCompareNode["html"]){
            // tolerance -1
            tolerance -= 1 
        }

        // if the tolerance is -1, there has been enough element different to justify a new page
        if (tolerance === 0){
            return true
        }
            
        // get parent of node, radius -1, until radius is 0
        if (radius > 0){
            parentID = await originalPage.evaluate((childID) => {
               let child = document.querySelector(`[data-cms-saneitizer="${childID}"]`)
               let newParentID = parseInt((child.parentElement).dataset.cmsSaneitizer)
            //    (function getNextID(child){
            //         potentialPa
            //    })(child)
                return newParentID
            }, rootElementID)
            return checkNodes(originalPage, eventPage, parentID, tolerance, radius-1)
        }

        // pages are similar enough, to not have a new page
        return false
    }


    if (radius > -1){
        return await checkNodes(originalPage, eventPage, rootElement.element.dataId, tolerance, radius)
    }
    // radius being -1 by default means compare every element
    // get how far the radius is form the top level element, then call func
    radius = await originalPage.evaluate((rootElementID)=>{
        let root = document.querySelector(`[data-cms-saneitizer="${rootElementID}"]`)
        // recurse up the dom tree until reaching the body, returning the recurse number
        let newRadius = (function getParent(count, element){
            if (element.tagName === 'BODY'){
                return count
            }
            return getParent(count+1, element.parentElement)
        })(0, root)
        return newRadius
    },rootElement.element.dataId)
    return await checkNodes(originalPage, eventPage, rootElement.element.dataId, tolerance, radius)
}
/**
 * Set a program delay
 * 
 * @param {Number} milliseconds amount of milliseconds to delay
 * @returns Promise
 */
function delay (milliseconds){
    new Promise(res => setTimeout(res, milliseconds))
}

/**
 * Execute an event
 * 
 * @param {ElementHandle} elementHandle puppeteer element handle object
 * @param {String} event event to check
 */
const performEvent = async (elementHandle, event) => {
    switch(event){
        case String(event.match(/touch/g)):
            await elementHandle.evaluate(e => e.tap())
            break
        case String(event.match(/focus/g)):
            await elementHandle.evaluate(e => e.focus())
            break
        case String(event.match(/select/g)):
            await elementHandle.evaluate(e => e.select())
            break  
        default:
            await elementHandle.evaluate(e => e.click())
    }
    await delay(WAIT_TIME)
}

/**
 * Open a new page in puppeteer at the same place as the origin page
 * 
 * @param {Page} page old puppeteer page object
 * @returns new page
 */
async function newPage(page){
    let page2 =await browser.newPage()

    await page2.goto(await page.url())
	
    await minimizeBrowser(page)

    // wait for content to load
	await page2.waitForNetworkIdle()

    return page2
}


/**
 * Refresh a page
 * 
 * @param {Page} page puppeteer page object to reload
 */
async function reloadPage(page){
    await page.reload()
	
    // wait for content to load
	await page.waitForNetworkIdle()

    await assignPageIDs(page)
}


module.exports = {detect}