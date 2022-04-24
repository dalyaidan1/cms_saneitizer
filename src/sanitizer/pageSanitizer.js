const sanitizeHTML = require('sanitize-html')
const prettier = require('prettier')
const fs  = require('fs')
const jsdom = require('jsdom')
const {JSDOM} = jsdom


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
    page = sanitizeHTML(page, {
        allowedTags: sanitizeHTML.defaults.allowedTags.concat([ 'img', 'iframe' ])
      })

    // clean tags 
    // make a real page to output, get outerHTML, remove it, then import back?
    let pageToEdit = new JSDOM(page)
    function removeElement(element){
        let elementInDOM = pageToEdit.window.document.querySelector(element)
        if (elementInDOM !== null){
            elementInDOM.remove()
        }
    }
    // -- remove nav
    removeElement('nav')
    // -- remove footer 
    removeElement('footer')
    // --remove tags user doesn't want
    
    page = pageToEdit.window.document.body.outerHTML
    
    // remove ads
    // npm package

    // organize to template

    // beautify
    page = prettier.format(page, {parser:"html"})

    // escape ",',/ and \ for the database
    page = page.replace(/\"/g, '\\\"')
    page = page.replace(/\'/g, '""')

    return page

}

 module.exports = (page, domainHome) => pageSanitizer(page, domainHome)