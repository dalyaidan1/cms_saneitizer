const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const {formatDirectoryTitle} = require('./generateHelpers')

async function newLink(node, makeDirectory){
    let tempLink = `<li><a href="${node.properties.url}">${node.properties.title}</a></li>\n`
    fs.appendFileSync(NAV_FILE, tempLink)
    if (makeDirectory){
        const filePathName = `public/html${node.properties.name}`.match(/\.html/) !== null 
        ? `public/html${node.properties.name}`
        : `public/html${node.properties.name}.html`
        fs.writeFileSync(filePathName, node.properties.content)
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
    if(!(file.includes(node.properties.url))){
        if (node.labels[0] === "Page"){
            await newLink(node, makeDirectory)
        }

        if (node.labels[0] === "Directory"){
            await newDirectory(node, databaseAccessor, makeDirectory)
        }
    }
}

module.exports = {
    generateLink
}