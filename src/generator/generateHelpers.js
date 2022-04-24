/**
 * Format a directory for export
 * 
 * @param {String} name 
 * @returns formatted directory title
 */
function formatDirectoryTitle(name){
    name = name.replace(/-|_/g, ' ')
    return String(name.match(/([^\/]*$)/)[0])
}

/**
 * Format a URL for export
 * 
 * @param {String} url 
 * @returns formatted URL
 */
function formatAnchorURL(url){
    url = url.replace(/\/\\"/g, '')
    url = url.replace(/\//, '')
    return url
}

/**
 * Get rid of the escape markers from the HTML stored in the database
 * 
 * @param {String} content 
 * @returns content
 */
function deScapeContent(content){
    content = content.replace(/""/g, "'")    
    content = content.replace(/\\\"/g, '"')    
    return content
}

/**
 * Make sure all characters are legal for a filename
 * 
 * @param {String} filename 
 * @returns filename
 */
function escapeFilename(filename){
    return filename.replace(/\?|=|\$|&|%/g, '')
}

module.exports = {
    formatDirectoryTitle,
    formatAnchorURL,
    deScapeContent,
    escapeFilename,
}