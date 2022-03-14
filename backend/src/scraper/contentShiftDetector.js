const fs = require('fs')
const USER_CONFIG = JSON.parse(fs.readFileSync('./src/USER_CONFIG.json'))
const PROPS_TO_CHECK = USER_CONFIG["NODE_PROPS"]
const IGNORABLE_ELEMENTS = USER_CONFIG["IGNORABLE_ELEMENTS"]
const TOLERANCE = USER_CONFIG["TOLERANCE"]
const RADIUS = USER_CONFIG["RADIUS"]
let browser



async function detect(b, page, databaseAccessor){
    // set browser
    browser = b

    // second page for comparisons
    let page2 = await newPage(page)

    // start with the body
    const startElement = ['body']

    // loop through the nested elements
    async function detectNestedElements(parentElements){
        for (let parentElement in parentElements){
            // get child elements
            const page1Children = await page.$eval(parentElements[parentElement], (element) => {
                return element.children
            })
            const page2Children = await page2.$eval(parentElements[parentElement], (element) => {
                return element.children
            })

            // loop through the elements
            for (element in page1Children) {
                if (await checkValidElement(page1Children[element])){
                    for (prop of Object.keys(PROPS_TO_CHECK)){
                        await performAction(page2Children[element], prop)
                        // check action with tol and rad, against p1 and p2
                        // if (await checkPages(page, page2)){
                        //     await databaseAccessor.addNewNodeFromPage(page2)
                        // }
                        // reload page2 for next round
                        await reloadPage(page2)
                    }
                }            
            }

            for  (child of page1Children){
                if (child.hasChildNodes()){
                    return detectNestedElements(`${parentElements[parentElement]} ${child.nodeName}`)
                }
            }
            // if children on element, for each child return detectNestedElements(child)
        }
    }
    return await detectNestedElements(startElement)
}

async function checkPages(originalPage, changedPage, rootElement, tolerance=0, radius=RADIUS){
    // look at the ch
    const originalElement = await originalPage.$$(rootElement)
    const changedElement = await changedPage.$$(rootElement)

    let checks = {
        children: false,
        siblings: false,
        parent: false
    }

    if (tolerance < TOLERANCE){
        // if radius !== -1, then return checkPages, next element
    
        // if radius is 0, then just use a string compare

        // else

            // check the elements children by a for loop
                // if the elements have children and radius != -1
                let childResult = await checkPages(originalPage, changedPage, childElement, tolerance, radius-1)
                if (childResult == false){
                    tolerance += 1
                    checks.children = false
                }
                

        // check the element siblings in for loop
            // if the elements have children and radius != -1
            let siblingResult = await checkPages(originalPage, changedPage, siblingElement, tolerance, radius-1)
            if (siblingResult == false){
                tolerance += 1
                checks.siblings = false
            }

        // check the parent element 
            let parentResult = await checkPages(originalPage, changedPage, childElement, tolerance, radius-1)
            if (parentResult === false){
                tolerance += 1
                checks.parent = false
            }

        // if anything is different 
        if (Object.values(checks).filter(val => val === true) > 0){
            return false
        } else {
            return true
        }  
    }
    return true  
}

// check that the element is not in ignored elements 
const checkValidElement = async (element) => {
    // TODO: make sure IGN_ELEM follows format rules of 
    // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_tagname2
    if (!(IGNORABLE_ELEMENTS.includes(element.tagName))){
        return true
    }
    return false
}


const performAction = async (element, propInQuestion) => {
    if (PROPS_TO_CHECK[propInQuestion].check === true){
        // let attributes = await element.evaluate(element => {
        //     return element.getEventListeners()
        // })
        // let attribute = element[propInQuestion]
        // if (attribute !== undefined){
            // if the elements value is not in the ignore
            let matchingAttributes = PROPS_TO_CHECK[propInQuestion].ignoreWhenContaining
                                        .filter(attr => element.attributes.includes(attr))
            if (matchingAttributes.length === 0){
                switch(propInQuestion){
                    case String(propInQuestion.match(/touch/g)):
                        await element.tap
                        break
                    case String(propInQuestion.match(/focus/g)):
                        await element.focus
                        break
                    case String(propInQuestion.match(/select/g)):
                        await element.select
                        break  
                    default:
                        await element.click
                }
            }
        // }           
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