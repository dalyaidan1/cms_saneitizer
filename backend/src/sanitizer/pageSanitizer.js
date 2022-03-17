const sanitizeHTML = require('sanitize-html')
const prettier = require('prettier')


function pageSanitizer(page, domain){
    // clean attributes/props
        // make link relative
            page = page.replace(/href="\//g, 'href="')

        // remove domain, to make all internal links relative
            // escape characters the domain
            const escapedDomain = domain.replace(/\/|\./g, '\\$&')
            // remove domain
            const domainRegex = new RegExp(`href="${escapedDomain}\/`, "g");
            page = page.replace(domainRegex, 'href="')

        // add html to end of urls          
            // relative case, using regex groups
            // case of /page"
            page = page.replace(/(href=".*)(")/g, '$1.html"')
            // case of above /page/" being turned to /page/.html
            page = page.replace(/(href=".*)(\/.html")/g, '$1.html"')
    

    // basic sanitization
    page = sanitizeHTML(page)

    // clean tags 
    // make a real page to output, get outerHTML, remove it, then import back?
    // -- remove nav
    // -- remove footer 
    // --remove tags user doesn't want
    
    
    // remove ads
    // npm package

    // beautify
    page = prettier.format(page, {parser:"html"})

    // escape ",',/ and \ for the database
    page = page.replace(/\"/g, '\\\"')
    page = page.replace(/\'/g, '""')
    
    // organize to template

    return page

}

 module.exports = (page, domainHome) => pageSanitizer(page, domainHome)