const config = require('../USER_CONFIG.json')

/**
 * Check if one page is the child of another
 * 
 * @param {String} innerPageURL 
 * @param {String} outerPageURL 
 * @returns true or false
 */
function layerIsAChildOfOtherLayer(innerPageURL, outerPageURL){
    let match = false

    const outerLayerNumber = getLayer(outerPageURL)
    const innerLayerNumber = getLayer(innerPageURL)
    //  this is the end part of a url like in "domain.com/about" the about
    const outerLayerEndURL =  String(outerPageURL.match(/([^\/]*$)/))
    //  this is the parent of the end part of a url like in "domain.com/about/our-history" the about
    const innerLayerParentURL = String((innerPageURL.replace(/\/[^\/]*$/, '')).match(/[^\/]*$/))

    // check the parent layer level is 1 lower than the child
    // check the parent name is really the name before child 
    if (
        ((innerLayerNumber - outerLayerNumber) === 1)
        && innerLayerParentURL === outerLayerEndURL){
            return true
        }

    return match
}


/**
 * Get the layer of a page
 * 
 * @param {String} url 
 * @returns layer number 
 */
function getLayer(url){
    // remove the protocol as it contains two forward slashes
    url = url.replace(/http:\/\/|https:\/\//g, '')

    // find the total forward slashes, if none 0
    const count = (url.match(/\//g) || []).length
    // TODO check if anything nothing follows the last "/" when the count is 0 aka home page case
    if (count === 1){
        // error handling possibilities unknown atm
        return 1
    }
    return count
}

/**
 * Prep a title to be stored in the database
 * 
 * @param {String} title 
 * @returns title
 */
function sanitizeTitle(title){
    title = String(title.replace(/\'/g, `\\'`))
    title = String(title.replace(/\"/g, `\\"`))
    return title
}


/**
 * Remove the domain from a URL
 * 
 * @param {String} url full URL
 * @param {String} domainHome protocol and domain to be removed
 * @returns name
 */
function removeDomainFromURL(url, domainHome){
    if (domainHome.match(/http:\/\//) !== null){
        if (url.match(/http:\/\//) === null){
            domainHome = domainHome.replace(/http:\/\//, 'https:\/\/')
        }
        return url.replace(domainHome, '')
    }

    if (domainHome.match(/https:\/\//) !== null){
        if (url.match(/https:\/\//) === null){
            domainHome = domainHome.replace(/https:\/\//, 'http:\/\/')
        }
        return url.replace(domainHome, '')
    }

    return url.replace(domainHome, '')
}

/**
 * Format a name for the database from a URL
 * 
 * @param {String} url full URL to be converted to a name
 * @param {String} domainHome protocol and domain to be removed
 * @returns 
 */
function formatPageName(url, domainHome){
    url = url.replace(/www\./, '')
    url = removeDomainFromURL(url, domainHome)
    return url
}

/**
 * Calculate the title for a Page
 * 
 * @param {Page} page puppeteer page object
 * @returns title
 */
async function getTitle(page){
    const titleConfig = config.DRAW_PAGE_TITLE_FROM
    if (titleConfig.title){
        return await page.title()
    }
    if (titleConfig.urlSnippet){
        let url = await page.url()
        // match the last part of the url to the / or the first / to the second /, then get ride of /
        url = String(
            url
                .match(/\/[a-zA-Z0-9.%?='"_-]*\/$|\/[a-zA-Z0-9.%?='"_-]*$|\/[a-zA-Z0-9.%?='"_#-]*\/[#\?=][a-zA-Z0-9.%?='"_-]*$/))
                .replace(/\//, '')
        return url  
    }
}


module.exports = {
    layerIsAChildOfOtherLayer,
    getLayer,
    sanitizeTitle,
    removeDomainFromURL,
    formatPageName,
    getTitle,
}