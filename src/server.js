const express = require('express')
const app = express()
const driver = require('./database/neo4jDriver')

// cors middleware
const cors = require('cors')
app.use(cors())


// decode responses with body parser middleware
const bodyParser = require('body-parser')
app.use(bodyParser.json())


app.listen(5000)

// home page route
app.get('/', function (req, res) {
    res.send('Hello World')
  })


// start app route
app.post('/api/start', async (req, res) => {
    const fs = require('fs')
    let decodedResponse = req.body
    if (decodedResponse.data.start){
        await writeConfig(decodedResponse.data)
        let sendBack = await start()
        if (sendBack){
            await exportData(false, true)
            let data = (fs.readFileSync('./public/html/navigation.html')).toString()
            res.json({"data":data})
        }
        await exportData(true, false)
    }   	
})


// start app route
app.get('/api/export/nav', async (req, res) => {
    // let export = await response	
})

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
    const fsPromises = require('fs').promises

    // set the config
    await fsPromises.writeFile('./src/USER_CONFIG.json', JSON.stringify(data))
        .catch(error => console.error(error))
}

async function exportData(withFiles, forAdjustments){
    const {exportHTML} = require('./appController')
    return await exportHTML(driver, withFiles, forAdjustments)
}