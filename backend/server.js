const browserObject = require('./browser')
const scraperController = require('./pageController')

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser()

// Pass the browser instance to the scraper controller
scraperController(browserInstance)

const listOfLinks = require("./listOfLinks.json")
console.log(Object.keys(listOfLinks).length)
// const puppeteer = require('puppeteer')
// const { Readability } = require('@mozilla/readability')
// const { JSDOM } = require('jsdom')


// const sanitize = (html) => {
//     const nav = findNav(html)
// }

// const findNav = (html) => {
//     navCount = 0
//     // html.evaluate()
// }



// (async () => {
//     const browser = await puppeteer.launch( {headless:true})
//     const page = await browser.newPage()
//     const url = "https://ucc.ie/"
//     await page.goto(url)
  
//     await page.waitForTimeout(5000)
    
//     const divCount = await page.$$eval('div', (divs) => divs.length)

//     const html = await page.evaluate(() => {
//         // eliminate ads, sidebars

//         // console.log(2)
//         // nav

//         // const checkSubNav = (all) => {
//         //     try{
//         //         return all.querySelectorAll(".nav")
//         //     } catch {
//         //         return 0
//         //     }
//         // }

//         // const checkMainNav = (all) => {
//         //     try{
//         //         return all.querySelectorAll("nav")
//         //     } catch {
//         //         return 0
//         //     }
//         // }

//         // h1


//         // 


//         // const all = document.querySelector("html")
//         // const navs = {
//         //     semanticNavTag: checkMainNav(all), 
//         //     navClass: checkSubNav(all),
//         // }

//         // return navs


//         // return document.querySelector("html").innerHTML
//         const as = document.querySelectorAll("a")

//         const a = {}
//         for (let l of as){
//             a[l.innerHTML] = (l.href)
//         }

//         // console.log(as)

//         return a
        
//     })
//     // var doc = new JSDOM(html)

//     // var article = await new Readability(doc.window.document).parse()
//     // console.log(article)


//     console.log(html)
//     await browser.close()

// })()
