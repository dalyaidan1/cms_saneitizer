const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
let databaseAccessor

function formatDirectoryTitle(name){
    name = name.replace(/-|_/g, ' ')
    return String(name.match(/([^\/]*$)/)[0])
}

async function newLink(node){
    let tempLink = `<li><a href="${node.properties.url}">${node.properties.title}</a></li>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
}

async function newDirectory(node){
    let tempLink = `<li>\n<span>${formatDirectoryTitle(node.properties.name)}</span>\n<ul>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
    let name = node.properties.name === '' 
        ? 'Home'
        : node.properties.name
    let children = await databaseAccessor.getNodeChildren(name)
    if (children[0] !== null){
        for (child in children){
            let temp = children[child]
            await generateLink(children[child])
        }            
    }
    fs.appendFileSync(NAV_FILE, '</ul>\n</li>\n')
}

async function generateLink(node){
    let file = fs.readFileSync(NAV_FILE)
    if(!(file.includes(node.properties.url))){
        if (node.labels[0] === "Page"){
            await newLink(node)
        }

        if (node.labels[0] === "Directory"){
            await newDirectory(node)
        }
    }
}


// open navigation.html
// const navigation = fs.writeFileSync('../../public/html/navigation.html', JSON.stringify(pageTracker))
// write first html, nav, and ul tags
const navigation = {
    async generateNav(dba){
        databaseAccessor = dba
        const firstLayer = 0
        const firstNavParts = "<html>\n<nav>\n<ul>\n"
        fs.writeFileSync(NAV_FILE, firstNavParts)
        async function generateLayer(layer){
            if (layer < 6){
                const layerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
                for (let node in layerNodes){
                    await generateLink(layerNodes[node])
                }            
                return generateLayer(layer+1)
            } else {
                fs.appendFileSync(NAV_FILE, '</nav>')
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