const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const linkMaker = require("./generateLink")
const jsdom = require('jsdom')
const {JSDOM} = jsdom

// open navigation.html
// const navigation = fs.writeFileSync('../../public/html/navigation.html', JSON.stringify(pageTracker))
// write first html, nav, and ul tags
const exporter = {
    async generateExport(databaseAccessor, makeDirectory=false, forAdjustments, currentNav){
        const firstLayer = 0
        // const lastLayer = await databaseAccessor.getMaxLayer();
        const firstNavParts = "<html>\n<nav>\n<ul>\n"
        fs.writeFileSync(NAV_FILE, firstNavParts)
        async function generateLayer(layer){
            if (layer <= 1){
                const layerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
                for (let node in layerNodes){
                    await linkMaker.generateLink(layerNodes[node], databaseAccessor, makeDirectory, forAdjustments, currentNav)
                }            
                return generateLayer(layer+1)
            } else {
                fs.appendFileSync(NAV_FILE, '</nav>')
                // remove empties
                let navToEdit = new JSDOM((fs.readFileSync(NAV_FILE)).toString())
                let spans = Array.from(navToEdit.window.document.querySelectorAll('span'))
                for (let span of spans){
                    let y = span.innerHTML
                    if (span.innerHTML === '\n'|| span.innerHTML === '' || span.innerHTML === ' ' ){
                        span.parentElement.remove()
                    }
                }
                let uls = Array.from(navToEdit.window.document.querySelectorAll('ul'))
                for (let ul of uls){
                    if (ul.innerHTML === '\n'|| ul.innerHTML === '' || ul.innerHTML === ' ' ){
                        ul.remove()
                    }
                }
                fs.writeFileSync(NAV_FILE, navToEdit.window.document.querySelector('nav').outerHTML)
            }            
        }
        return await generateLayer(firstLayer) 
    }
}


module.exports = exporter
