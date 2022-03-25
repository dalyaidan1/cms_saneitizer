const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const {
    formatDirectoryTitle, 
    formatAnchorURL,
    deScapeContent,
    escapeFilename,
} = require('./generateHelpers')

async function newLink(node, makeDirectory, forAdjustments){
    let tempLink = `<li><a href="${formatAnchorURL(node.properties.name)}.html">${formatAnchorURL(node.properties.title)}</a></li>\n`
    if (forAdjustments){
        tempLink = `<li data-cmss-name=${node.properties.name}>
                        <a href="${node.properties.url}" target="_blank">${formatAnchorURL(node.properties.title)}</a></li>\n`
    }
    fs.appendFileSync(NAV_FILE, tempLink)
    if (makeDirectory){
        let nodeName = node.properties.name

        if (nodeName === ''){
            nodeName = `/index`
        }

        if ((nodeName).match(/^\//) === null){
            nodeName = `/${nodeName}`
        }
        const filePathName = `public/html${nodeName}`.match(/\.html/) !== null 
        ? `public/html${nodeName}`
        : `public/html${nodeName}.html`
        
        fs.writeFileSync(escapeFilename(filePathName), deScapeContent(node.properties.content))
    }
}

async function newDirectory(node, databaseAccessor, makeDirectory, forAdjustments){
    let tempLink = `<li>\n<span id=${node.properties.id}>${formatDirectoryTitle(node.properties.name)}</span>\n<ul>\n`
    fs.appendFileSync(NAV_FILE, tempLink)

    if (makeDirectory){
        let dpath = (node.properties.name).match(/^\//) === null 
            ? `/${node.properties.name}`
            : node.properties.name
        fs.mkdirSync(`public/html${dpath}`, { recursive: true })
    }

    let name = node.properties.name === '' 
        ? 'Home'
        : node.properties.name
    let children = await databaseAccessor.getNodeChildren(name)
    if (children[0] !== null){
        for (child in children){
            await generateLink(children[child], databaseAccessor, makeDirectory, forAdjustments)
        }            
    }
    fs.appendFileSync(NAV_FILE, '</ul>\n</li>\n')
}

async function generateLink(node, databaseAccessor, makeDirectory, forAdjustments){
    let file = fs.readFileSync(NAV_FILE)
    let fileString = file.toString()
    
    if(!(fileString
            .includes(forAdjustments 
                ? node.properties.url 
                :`${formatAnchorURL(node.properties.name)}.html`))){        
        if (node.labels[0] === "Page"){
            await newLink(node, makeDirectory, forAdjustments)
        }
        
    }
    if(!(fileString
        .includes(`<span id=${node.properties.id}>${formatDirectoryTitle(node.properties.name)}</span>`))){  
        if (node.labels[0] === "Directory"){
            await newDirectory(node, databaseAccessor, makeDirectory, forAdjustments)
        }
    }
}

module.exports = {
    generateLink
}