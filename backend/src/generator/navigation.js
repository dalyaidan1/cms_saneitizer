const fs = require('fs')

// open navigation.html
// const navigation = fs.writeFileSync('../../public/html/navigation.html', JSON.stringify(pageTracker))
// write first html, nav, and ul tags
const navigation = {
    async generateNav(databaseAccessor){
        const firstLayer = 0
        const firstNavParts = "<html>\n<nav>\n<ul>\n"
        fs.writeFileSync('public/html/navigation.html', firstNavParts)
        async function generateLayer(layer){
            if (layer < 6){
                const layerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
                for (let node of layerNodes){
                    if (node.labels[0] === "Page"){
                        let tempLink = `<li><a href="${node.properties.url}">${node.properties.title}</a></li>\n`
                        fs.appendFileSync('public/html/navigation.html', tempLink)
                    }
                }            
                return generateLayer(layer+1)
            }
        }
        return generateLayer(firstLayer)
    }
}
// get a layer


module.exports = navigation
// for each node check if page or dir
// if a page"", write an anchor with the url and title nested inside a li
{/* <li><a href="page.url">PAGE NAME</a></li> */}

// if a dir make a ul(dir items) and a span(dir name) nested in a li
{/* <li>
    <span>DIR NAME</span>
    <ul>
        
    </ul>
</li> */}
// if children exist, get the next layer of the dir and repeat from the for

// recursively call get a layer + 1 until, last layer