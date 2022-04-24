const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const linkMaker = require("./generateLink")
const jsdom = require('jsdom')
const {JSDOM} = jsdom

const exporter = {
    /**
     * Export the website from the database
     * 
     * @param {DatabaseAccessor} databaseAccessor object giving access to database transactions
     * @param {Boolean} makeDirectory export file structure
     * @param {Boolean} forAdjustments export nav for show
     * @param {Navigation} currentNav object containing nav for recursive descent
     * @returns none
     */
    async generateExport(databaseAccessor, makeDirectory=false, forAdjustments, currentNav){
        const firstLayer = 0

        // write first html, nav, and ul tags
        const firstNavParts = "<html>\n<nav>\n<ul>\n"
        fs.writeFileSync(NAV_FILE, firstNavParts)

        /**
         * Start the descending the tree structure from the database
         * @param {Number} layer layer to start
         * @returns none
         */
        async function generateLayer(layer){
            if (layer <= 1){
                const layerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
                for (let node in layerNodes){
                    await linkMaker.generateLink(layerNodes[node], databaseAccessor, makeDirectory, forAdjustments, currentNav)
                }            
                return generateLayer(layer+1)
            } else {
                fs.appendFileSync(NAV_FILE, '</nav>')

                // remove any empty nodes from the navigation
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
