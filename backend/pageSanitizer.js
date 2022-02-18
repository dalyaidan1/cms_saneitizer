const sanitizeHTML = require('sanitize-html')
const prettier = require('prettier')


function pageSanitizer(page){

    // basic sanitization
    page = sanitizeHTML(page)
    // clean tags
    // clean attributes/props
    // remove ads

    // beautify
    page = prettier.format(page, {parser:"html"})

    
    // organize to template

    // add to db --
    //  just return a page for now to get mvp out with a json
    // return page
    return page

}

 module.exports = (page) => pageSanitizer(page)