const puppeteer = require('puppeteer')

async function startBrowser(){
	let browser
	try {
	    console.log("Opening the browser......")
	    browser = await puppeteer.launch({
	        headless: false,
			devtools:true,
	        args: ["--disable-setuid-sandbox", "--no-sandbox"],
	        'ignoreHTTPSErrors': true
	    })
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err)
	}
	return browser
}

async function startFrontBrowser(){
	let browser
	try {
	    console.log("Opening the browser......")
	    browser = await puppeteer.launch({
	        headless: false,
			defaultViewport: null,
	        args: ["--start-maximized", "--no-default-browser-check", "-test-type", `--app=${process.env.FRONT_END_URL}`],
			ignoreDefaultArgs: ["--enable-automation"],
	        'ignoreHTTPSErrors': true
	    })
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err)
	}
	return browser
}

module.exports = {
	startBrowser,
	startFrontBrowser
}