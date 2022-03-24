async function minimizeBrowser(page){
	// Create raw protocol session.
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
}

module.exports = {
    minimizeBrowser
}