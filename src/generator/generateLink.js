const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const {
    formatDirectoryTitle, 
    formatAnchorURL,
    deScapeContent,
    escapeFilename,
} = require('./generateHelpers')

async function newLink(node, makeDirectory){
    let tempLink = `<li><a href="${formatAnchorURL(node.properties.name)}.html">${node.properties.title}</a></li>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
    if (makeDirectory){
        let nodeName = node.properties.name
        if ((nodeName).match(/^\//) === null){
            nodeName = `/index${nodeName}`
        }
        const filePathName = `public/html${nodeName}`.match(/\.html/) !== null 
        ? `public/html${nodeName}`
        : `public/html${nodeName}.html`
        
        fs.writeFileSync(escapeFilename(filePathName), deScapeContent(node.properties.content))
    }
}

async function newDirectory(node, databaseAccessor, makeDirectory){
    let tempLink = `<li>\n<span>${formatDirectoryTitle(node.properties.name)}</span>\n<ul>\n`
    fs.appendFileSync(NAV_FILE, tempLink)

    if (makeDirectory){
        fs.mkdirSync(`public/html${node.properties.name}`, { recursive: true })
    }

    let name = node.properties.name === '' 
        ? 'Home'
        : node.properties.name
    let children = await databaseAccessor.getNodeChildren(name)
    if (children[0] !== null){
        for (child in children){
            await generateLink(children[child], databaseAccessor, makeDirectory)
        }            
    }
    fs.appendFileSync(NAV_FILE, '</ul>\n</li>\n')
}

async function generateLink(node, databaseAccessor, makeDirectory){
    let file = fs.readFileSync(NAV_FILE)
    
    if(file.indexOf(`${formatAnchorURL(node.properties.name)}.html`) < 1){        
        if (node.labels[0] === "Page"){
            await newLink(node, makeDirectory)
        }
        
    }
    if (node.labels[0] === "Directory"){
        await newDirectory(node, databaseAccessor, makeDirectory)
    }
}

module.exports = {
    generateLink
}