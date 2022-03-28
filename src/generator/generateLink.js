const fs = require('fs')
const NAV_FILE = 'public/html/navigation.html'
const {
    formatDirectoryTitle, 
    formatAnchorURL,
    deScapeContent,
    escapeFilename,
} = require('./generateHelpers')

async function newLink(node, makeDirectory, forAdjustments, currentNav){
    let tempLink = `<li><a href="${formatAnchorURL(node.properties.name)}.html">${formatAnchorURL(node.properties.title)}</a></li>\n`
    if (forAdjustments){
        tempLink = `<li data-cmss-name=${node.properties.name}>
                        <a href="${node.properties.url}" target="_blank">${formatAnchorURL(node.properties.title)}</a></li>\n`        
    }
    currentNav.append({element:'li', type:'start', label:"L", props:{
        name:node.properties.name,
        layer:node.properties.layer,
        url:node.properties.url,
        id:node.properties.id,
    }})
    currentNav.append({element:'a', type:'start', props:{
        name:node.properties.name,
        layer:node.properties.layer,
        url:node.properties.url,
        id:node.properties.id,}
    })
    currentNav.append({element:'a', type:'end'})
    currentNav.append({element:'li', type:'end'})
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

async function newDirectory(node, databaseAccessor, makeDirectory, forAdjustments, currentNav){
    let tempLink = `<li>\n<span id=${node.properties.id}>${formatDirectoryTitle(node.properties.name)}</span>\n<ul>\n`

    currentNav.append({element:'li', type:'start', label:"D"})
    currentNav.append({element:'span', type:'start', props:{
        name:node.properties.name,
        layer:node.properties.layer,
        url:node.properties.url,
        id:node.properties.id,}
    })
    currentNav.append({element:'span', type:'end'})
    currentNav.append({element:'ul', type:'start'})

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
            await generateLink(children[child], databaseAccessor, makeDirectory, forAdjustments, currentNav)
        }            
    }
    currentNav.append({element:'ul', type:'end'})
    currentNav.append({element:'li', type:'end'})
    fs.appendFileSync(NAV_FILE, '</ul>\n</li>\n')
}

async function generateLink(node, databaseAccessor, makeDirectory, forAdjustments, currentNav){
    let file = fs.readFileSync(NAV_FILE)
    let fileString = file.toString()
    
    if(!(fileString
            .includes(forAdjustments 
                ? node.properties.url 
                :`${formatAnchorURL(node.properties.name)}.html`))){        
        if (node.labels[0] === "Page"){
            await newLink(node, makeDirectory, forAdjustments, currentNav)
        }
        
    }
    if(!(fileString
        .includes(`<span id=${node.properties.id}>${formatDirectoryTitle(node.properties.name)}</span>`))){  
        if (node.labels[0] === "Directory"){
            await newDirectory(node, databaseAccessor, makeDirectory, forAdjustments, currentNav)
        }
    }
}

module.exports = {
    generateLink
}