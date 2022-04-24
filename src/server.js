const express = require('express')
const app = express()
const driver = require('./database/neo4jDriver')
const fs = require('fs')
const fsPromises = fs.promises
const Navigation = require('./generator/navigation')
const currentNav = new Navigation()

// cors middleware
const cors = require('cors')
app.use(cors())


// decode responses with body parser middleware
const bodyParser = require('body-parser')
app.use(bodyParser.json())


app.listen(process.env.BACK_END_PORT);

(async () => {
    const appBrowserObject = require('./scraper/browser')
    let appBrowser = await appBrowserObject.startFrontBrowser()
    let [page] = await appBrowser.pages()   
    await page.setViewport({ width: 0, height: 0 })
    appBrowser.on('disconnected', () => {
        console.log('Closing......')
        driver.close()
        process.exit()
    })
})()


// start app route
app.post('/api/start', async (req, res) => {
    let decodedResponse = req.body
    if (decodedResponse.data.start){
        await writeConfig(decodedResponse.data)
        let sendBack = await start()
        if (sendBack){
            await exportData(false, true).then(async () => {
                await fsPromises.readFile('./public/html/navigation.html')
                    .catch(error => console.error(error))
                    .then(data => {
                        data = data.toString()
                        let nav = currentNav.get()
                        res.json({"data":data, nav:nav})
                    })
            })
            
        }      
    }   	
})


// export nav route
app.get('/api/export/nav', async (req, res) => {
    await exportData(true, false)
    .then(async () => {
        await delay(5000)
        await zip().then(            
            res.download('./public/newSite.zip') )
    })          
})


// get current nav
app.get('/api/nav', async (req, res) => {
    let data = (fs.readFileSync('./public/html/navigation.html')).toString()
    res.send({"data":data})
})

// adjust node route
app.post('/api/adjust-node', async (req, res) => {
    let decodedResponse = req.body
    const {formatDomain} = require('./scraper/scraperHelpers')
    const DatabaseAccessor = require('./database/databaseAccessor')
    const config = require('./USER_CONFIG.json')
    const domainHome = formatDomain(config.DOMAIN)
    const databaseAccessor = await new DatabaseAccessor(driver, domainHome)
    if (await databaseAccessor.updateNodeTitle(decodedResponse.data)){
        res.send(true)
    } else {
        res.send(false)
    }    
})


async function zip(){
    const AdmZip = require('adm-zip')
    const zip = new AdmZip()
    const outputFile = "./public/newSite.zip"
    zip.addLocalFolder("./public/html")
    zip.writeZip(outputFile)
    await delay(5000)
}

async function start(){
    const browserObject = require('./scraper/browser')
    const {scrapeAll} = require('./appController')

    // //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser()

    // Pass the browser instance to the scraper controller
    let scraped = await scrapeAll(browserInstance, driver)
    return scraped
}

async function writeConfig(data){
    // set the config
    return await fsPromises.writeFile('./src/USER_CONFIG.json', JSON.stringify(data))
        .catch(error => console.error(error))
}

async function exportData(withFiles, forAdjustments){
    const {exportHTML} = require('./appController')
    currentNav.clear()
    await exportHTML(driver, withFiles, forAdjustments, currentNav)
}

const delay = ms => new Promise(res => setTimeout(res, ms));