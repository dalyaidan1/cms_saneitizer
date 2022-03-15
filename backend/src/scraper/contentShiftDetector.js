const fs = require('fs')
const USER_CONFIG = JSON.parse(fs.readFileSync('./src/USER_CONFIG.json'))
const PROPS_TO_CHECK = USER_CONFIG["NODE_PROPS"]
const IGNORABLE_ELEMENTS = USER_CONFIG["IGNORABLE_ELEMENTS"]
const TOLERANCE = USER_CONFIG["TOLERANCE"]
const RADIUS = USER_CONFIG["RADIUS"]
let browser

// const addDatasetIds = require('./addDatasaetIds')

// get all event listeners on page
// remove 

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
                    // TODO: differ between urls ending in / vs .html (or other ext)
                    if (await checkPages(page, page2, node)){
                        let oldTitle = await page2.title()
                        let oldURL = await page2.url()
                        let newTitle = `${oldTitle} - ${node.element.dataId}`
                        let newURL = `${oldURL}${node.element.dataId}`
                        await databaseAccessor.setNewPageNodeFromPage(page2, {url:newURL,title:newTitle})
                    }
                    // reload page 2
                    await reloadPage(page2)
                }
            }
        }
    }
}

async function detectEventElements(page){

    const client = await page.target().createCDPSession()  

    async function getListener(objType){
        const {result} = await client
            .send('Runtime.evaluate', {expression: objType})
        // return result
        const {listeners} = await client
            .send('DOMDebugger.getEventListeners', {objectId: result.objectId})
        return listeners
    }

    let elements = await page.$$('*')
    
    let listeners = []

    // y.push(getListener('window'))

    // y.push(getListener('document'))

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
                            // debugger;
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

async function assignPageIDs(page){
    const injectScript = `(() => { 
        \nconst allTags = document.getElementsByTagName("*")
        \n for (let tag in allTags){ 
            \nallTags[tag].setAttribute("data-cms-saneitizer", tag)}})()`

    await page.addScriptTag({content:injectScript, type:"text/javascript"})
}

async function getElementHandle(page, element){
    return await page.$(`[data-cms-saneitizer="${element.dataId}"]`)
}


// check that the element is not in ignored elements 
const checkValidElement = async (element) => {
    // TODO: make sure IGN_ELEM follows format rules of 
    // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_tagname2
    if (IGNORABLE_ELEMENTS.includes(element)){
        return false
    }
    return true
}

// check that the element is not in ignored elements 
const getValidEvents = async (node) => {
    let validEvents = [...new Set(
        node.events.map(event => event.type)
    )]
    for (let event in node.events){
        let eventToCheck = node.events[event].type

        // if this event should be checked, according to the user
        if (PROPS_TO_CHECK[eventToCheck].check === true){

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

async function checkPages(originalPage, eventPage, rootElement, tolerance=0, radius=RADIUS){
    // simple string compare, to test
    // let oPageElements = await originalPage.$eval('body', body => body.innerHTML)
    // let cPageElements = await changedPage.$eval('body', body => body.innerHTML)
    // return !Boolean(Math.abs(oPageElements.localeCompare(cPageElements)))


    // TODO: properly compare changes with tolerance and radius 
    // look at the ch
    const originalElement = await originalPage.$(`[data-cms-saneitizer="${rootElement.element.dataId}"]`)
    const eventElement = await eventPage.$(`[data-cms-saneitizer="${rootElement.element.dataId}"]`)

    // let checks = {
    //     children: false,
    //     siblings: false,
    //     parent: false
    // }

    async function getRadiusHTML(page, rootElement, radius){
        return await page.evaluate((rootElement, radius) => {
            if (radius > 0){
                let root = document.querySelector(`[data-cms-saneitizer="${rootElement.element.dataId}"]`)
                let parent = (function getParent(element, left=radius){
                    if (left === 0){
                        return element
                    }
                    return getParent(element.parentElement, left-1)
                })(root)
                return parent.innerHTML
            } else {
                return document.body.innerHTML
            }
        },rootElement, radius)
    }


    let originalElementRadiusHTML = await getRadiusHTML(originalPage, rootElement, radius)

    let eventElementRadiusHTML = await getRadiusHTML(eventPage, rootElement, radius)

    return !(originalElementRadiusHTML === eventElementRadiusHTML)

    // if (tolerance < TOLERANCE){
    //     // if radius !== -1, then return checkPages, next element
    
    //     // if radius is 0, then just use a string compare

    //     // else

    //         // check the elements children by a for loop
    //             // if the elements have children and radius != -1
    //             let childResult = await checkPages(originalPage, changedPage, childElement, tolerance, radius-1)
    //             if (childResult == false){
    //                 tolerance += 1
    //                 checks.children = false
    //             }
                

    //     // check the element siblings in for loop
    //         // if the elements have children and radius != -1
    //         let siblingResult = await checkPages(originalPage, changedPage, siblingElement, tolerance, radius-1)
    //         if (siblingResult == false){
    //             tolerance += 1
    //             checks.siblings = false
    //         }

    //     // check the parent element 
    //         let parentResult = await checkPages(originalPage, changedPage, childElement, tolerance, radius-1)
    //         if (parentResult === false){
    //             tolerance += 1
    //             checks.parent = false
    //         }

    //     // if anything is different 
    //     if (Object.values(checks).filter(val => val === true) > 0){
    //         return false
    //     } else {
    //         return true
    //     }  
    // }
    // return true  
}

const performEvent = async (elementHandle, event) => {
    switch(event){
        case String(event.match(/touch/g)):
            await elementHandle.tap()
            break
        case String(event.match(/focus/g)):
            await elementHandle.focus()
            break
        case String(event.match(/select/g)):
            await elementHandle.select()
            break  
        default:
            await elementHandle.click()
    }
}

async function newPage(page){
    let page2 =await browser.newPage()

    await page2.goto(await page.url())
	
    // wait for content to load
	await page2.waitForNetworkIdle()

    return page2
}

async function reloadPage(page){
    await page.reload()
	
    // wait for content to load
	await page.waitForNetworkIdle()
}


module.exports = {detect}