function formatDirectoryTitle(name){
    name = name.replace(/-|_/g, ' ')
    return String(name.match(/([^\/]*$)/)[0])
}

function formatAnchorURL(url){
    url = url.replace(/\/\\"/g, '')
    url = url.replace(/\//, '')
    return url
}

function deScapeContent(content){
    content = content.replace(/""/g, "'")    
    content = content.replace(/\\\"/g, '"')
    // content = content.replace(/\/"\//g, '"')
    
    return content
}

module.exports = {
    formatDirectoryTitle,
    formatAnchorURL,
    deScapeContent,
}