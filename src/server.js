const express = require('express')
const app = express()

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
    let decodedResponse = req.body
    if (decodedResponse.data.start){
        let sendBack = await start(decodedResponse.data)
        if (sendBack){
            // res.send("ok")
            res.json({"data":"processed"})
        }
    }   	
})


// start app route
app.get('/api/export/nav', async (req, res) => {
    // let export = await repsonse	
})

async function start(data){
    const browserObject = require('./scraper/browser')
    const {scrapeAll} = require('./appController')
    const driver = require('./database/neo4jDriver')
    const fs = require('fs')
    
    // set the config
    fs.writeFileSync('./src/USER_CONFIG.json', JSON.stringify(data))

    // //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser()

    // Pass the browser instance to the scraper controller
    let scraped = await scrapeAll(browserInstance, driver)
    return scraped
}

async function exportData(withFiles){
    const {exportHTML} = require('./appController')
    const driver = require('./database/neo4jDriver')
    return await exportHTML(driver, withFiles)
}