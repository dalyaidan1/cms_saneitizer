const config = require('../USER_CONFIG.json')

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

function sanitizeTitle(title){
    title = String(title.replace(/\'/g, `\\'`))
    title = String(title.replace(/\"/g, `\\"`))
    return title
}

// regex a url to remove the domain, so key lookup is a tiny bit faster and less cluttered
function removeDomainFromURL(url, domainHome){
    // console.log(url);
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

function formatPageName(url, domainHome){
    url = removeDomainFromURL(url, domainHome)
    url = url.replace(/\/$/, '')
    return url
}

async function getTitle(page){
    const titleConfig = config.DRAW_PAGE_TITLE_FROM
    if (titleConfig.title){
        return await page.title()
    }
    if (titleConfig.urlSnippet){
        let url = await page.url()
        // match the last part of the url to the / or the first / to the second /, then get ride of /
        url = String(url.match(/\/[a-zA-Z0-9.%?='"_-]*\/$|\/[a-zA-Z0-9.%?='"_-]*$/)).replace(/\//, '')
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