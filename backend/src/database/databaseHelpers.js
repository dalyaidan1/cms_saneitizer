function layerIsAChildOfOtherLayer(innerPageURL, outerPageURL){
    let match = false

    const outerLayerNumber = getLayer(outerPageURL)
    const innerLayerNumber = getLayer(innerPageURL)
    //  this is the end part of a url like in "domain.com/about" the about
    const outerLayerEndURL =  String(outerPageURL.match(/([^\/]*$)/))
    //  this is the parent of the end part of a url like in "domain.com/about/our-history" the about
    const innerLayerParentURL = String((innerPageURL.replace(/\/[^\/]*$/, '')).match(/[^\/]*$/))
    if ((innerLayerNumber - outerLayerNumber) === 1){
        console.log(outerLayerNumber,innerLayerNumber,outerLayerEndURL,innerLayerParentURL)
    }

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
    return url.replace(domainHome, '')
}


module.exports = {
    layerIsAChildOfOtherLayer,
    getLayer,
    sanitizeTitle,
    removeDomainFromURL,
}