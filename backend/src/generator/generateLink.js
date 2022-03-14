const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const {formatDirectoryTitle} = require('./generateHelpers')

async function newLink(node){
    let tempLink = `<li><a href="${node.properties.url}">${node.properties.title}</a></li>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
}

async function newDirectory(node, databaseAccessor){
    let tempLink = `<li>\n<span>${formatDirectoryTitle(node.properties.name)}</span>\n<ul>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
    let name = node.properties.name === '' 
        ? 'Home'
        : node.properties.name
    let children = await databaseAccessor.getNodeChildren(name)
    if (children[0] !== null){
        for (child in children){
            await generateLink(children[child], databaseAccessor)
        }            
    }
    fs.appendFileSync(NAV_FILE, '</ul>\n</li>\n')
}

async function generateLink(node, databaseAccessor){
    let file = fs.readFileSync(NAV_FILE)
    if(!(file.includes(node.properties.url))){
        if (node.labels[0] === "Page"){
            await newLink(node)
        }

        if (node.labels[0] === "Directory"){
            await newDirectory(node, databaseAccessor)
        }
    }
}

module.exports = {
    generateLink
}