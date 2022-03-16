function formatDirectoryTitle(name){
    name = name.replace(/-|_/g, ' ')
    return String(name.match(/([^\/]*$)/)[0])
}

module.exports = {
    formatDirectoryTitle
}