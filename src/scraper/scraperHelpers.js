/**
 * Minimize the headful browser
 * 
 * @param {Page} page puppeteer page object
 */
async function minimizeBrowser(page){
	// Create raw protocol session.
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
}

/**
 * Make sure that the URL is a valid and consistent with the other URLs.
 * Standardize URLs...
 * 
 * @param {String} url 
 * @returns url
 */
function validateFirstURL(url){
    if (url.match(/\/$/) === null){
        url = `${url}/`
    }
    
    url = url.replace(/www\./, '')

    if (url.match(/http:\/\/|https:\/\//) === null){
        url = `https://${url}`
    }

    return url
}

/**
 * Standardize the domain for the app 
 * 
 * @param {String} domain 
 * @returns domain
 */
function formatDomain(domain){
    domain = validateFirstURL(domain)
    let protocol = domain.match(/http:\/\//) !== null ? 'http://' : 'https://'
    domain = domain.replace(/http:\/\/|https:\/\//, '')
    domain = domain.replace(/\//g, '')
	domain = `${protocol}${domain}`
    return domain
}

module.exports = {
    minimizeBrowser,
    validateFirstURL,
    formatDomain
}