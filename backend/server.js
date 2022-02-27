const browserObject = require('./browser')
const scraperController = require('./pageController')
const driver = require('./neo4jDriver')

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser()

// Pass the browser instance to the scraper controller
scraperController(browserInstance, driver)


// let session = driver.session()

//     // the Promise way, where the complete result is collected before we act on it:
//     session
//         .run(
//             `CREATE (page:Page {
//                 name: '/about',
//                 id: randomUuid(),
//                 url: 'http://page.com/about',
//                 layer: '2',
//                 title: 'About',
//                 content: '<html></html>',
//                 sanitized: 'false',
//                 occurrences: '1'
//             }
//                 ) 
//             RETURN page.name AS name`)
//         .then(result => {
//         result.records.forEach(record => {
//             console.log(record.get('name'))
//         })
//         })
//         .catch(error => {
//         console.log(error)
//         })
//         .then(() => session.close())  
    
//     // on application exit:
