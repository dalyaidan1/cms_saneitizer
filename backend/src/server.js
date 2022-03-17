const express = require('express')
const app = express()

// decode responses with body parser middleware
const bodyParser = require('body-parser')
app.use(bodyParser.json())


app.listen(5000)

// home page route
app.get('/', function (req, res) {
    res.send('Hello World')
  })


// start app route
app.post('/start', (req, res) => {
    let decodedResponse = req.body
    if (decodedResponse["start"]){
        const browserObject = require('./scraper/browser')
        const scraperController = require('./appController')
        const driver = require('./database/neo4jDriver')

        //Start the browser and create a browser instance
        let browserInstance = browserObject.startBrowser()

        // Pass the browser instance to the scraper controller
        scraperController(browserInstance, driver, app)
    }    	
})