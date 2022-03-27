async function minimizeBrowser(page){
	// Create raw protocol session.
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
}

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