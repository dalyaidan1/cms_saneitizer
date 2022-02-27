const neo4j = require('neo4j-driver')

class DatabaseAccessor {
    constructor(driver, domainHome){
        this.driver = driver
        this.sanitize = require('./pageSanitizer')
        this.domainHome = domainHome

    }

    async setNewTrackerNodeFromPage(page){	
        const url = await page.url()

        const name = this.removeDomainFromURL(url)

        const layer = this.getLayer(url)

        const title = this.sanitizeTitle(await page.title())

        const content = this.sanitize(
            await page.$eval('body', content => content.innerHTML)
            )
        let sanitized = false
        if (content.length !== 0){
            sanitized = true
        }

        let session = await this.driver.session()
        await session
            .run(
                `CREATE (page:Page {
                    name: '${name}',
                    id: randomUuid(),
                    url: '${url}',
                    layer: $layer,
                    title: '${title}',
                    content: \'${content}\',
                    sanitized: ${sanitized},
                    occurrences: $occurrences
                })`, {
                    layer: neo4j.int(layer),
                    occurrences: neo4j.int(1)
                })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                                
            })
        return name        
    }

    async updateTrackerNodeFromPage(page){
        const url = await page.url()

        const name = this.removeDomainFromURL(url)

        let pageMatch;

        let session = await this.driver.session()
        // get the node already in the db
        await session
            .run(
                `MATCH (page:Page {name: '${name}'})
                RETURN page AS page`)
            .then(async result => {
                pageMatch = result.records[0].get('page')                
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                         
            })
        let session2 = await this.driver.session()
        // if its sanitized just update its occurrences 
        if (pageMatch.sanitized){
            await session2.run(
                `MATCH (page:Page {name: '${name}'})
                SET page.occurrences = $occurrences`, {
                    occurrences: neo4j.int(pageMatch.occurrences + 1)
                }
            )
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => await session2.close())
        } else {
            // if not, need to update it
            const title = this.sanitizeTitle(await page.title())
            const content = this.sanitize(
                await page.$eval('body', content => content.innerHTML)
                )
            let sanitized = false
            if (content.length !== 0){
                sanitized = true
            }
            await session2.run(
                `MATCH (page:Page {name: '${name}'})
                SET page.title = '${title}',
                    page.content = \'${content}\',
                    page.sanitized = ${sanitized},
                    page.occurrences = $occurrences`, {
                    occurrences: neo4j.int(pageMatch.occurrences + 1)
                }
            )
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => await session2.close() )
        }            
        return page.name
    }

    async setNewTrackerNodeFromURL(url, outerPageURL = null){
        // const url = await page.url()

        const name = this.removeDomainFromURL(url)

        const layer = this.getLayer(url)

        let session = await this.driver.session()
        // set the page props
        await session
            .run(
                `CREATE (page:Page {
                    name: '${name}',
                    id: randomUuid(),
                    url: '${url}',
                    layer: $layer,
                    title: '',
                    content: '',
                    sanitized: false,
                    occurrences: $occurrences
                })`, {
                    layer: neo4j.int(layer),
                    occurrences: neo4j.int(1)
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                                               
            })
            // if setting an inner page
            if (outerPageURL !== null){
                const outerPageName = this.removeDomainFromURL(outerPageURL)
                let session2 = await this.driver.session()
                if (this.layerIsAChildOfOtherLayer(url, outerPageURL)){
                    await session2.run(
                        `MATCH 
                            (innerPage:Page),
                            (outerPage:Page)
                        WHERE 
                            innerPage.name = '${name}' 
                            AND outerPage.name = '${outerPageName}'
                        CREATE (innerPage)-[:PARENT]->(outerPage),
                            (outerPage)-[:CHILD]->(innerPage),
                            (outerPage)-[:LINKS_TO]->(innerPage)
                        `
                    )
                    .catch(error => {
                        this.logError(error, url);
                    })
                } else {
                    await session2.run(
                        `MATCH 
                            (innerPage:Page),
                            (outerPage:Page)
                        WHERE 
                            innerPage.name = '${name}'
                            AND outerPage.name = '${outerPageName}'
                        CREATE (outerPage)-[:LINKS_TO]->(innerPage)`
                    )
                    .catch(error => {
                        this.logError(error, url);
                    })
                }
                await session2.close()                    
            } 
        return name
    }

    async updateTrackerNodeOccurrences(url, outerPageURL = null){
        const name = this.removeDomainFromURL(url)
        let session = await this.driver.session()
        await session
            .run(
                `MATCH (page:Page {name: '${name}'})
                SET page.occurrences = page.occurrences + 1`
            )
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                
            })
            // if setting an inner page
            if (outerPageURL !== null){
                let session2 = await this.driver.session()
                const outerPageName = this.removeDomainFromURL(outerPageURL)
                await session2.run(
                    `MATCH 
                        (innerPage:Page),
                        (outerPage:Page)
                    WHERE 
                        innerPage.name = '${name}' 
                        AND outerPage.name = '${outerPageName}'
                    CREATE (outerPage)-[:LINKS_TO]->(innerPage)
                    `
                )
                .catch(error => {
                    this.logError(error, url);
                })
                await session2.close()
            } 
    }

    layerIsAChildOfOtherLayer(innerPageURL, outerPageURL){
        let match = false

        const outerLayerNumber = this.getLayer(outerPageURL)
        const innerLayerNumber = this.getLayer(innerPageURL)
        //  this is the end part of a url like in "domain.com/about" the about
        const outerLayerEndURL =  String(outerPageURL.match(/([^\/]*$)/))
        //  this is the parent of the end part of a url like in "domain.com/about/our-history" the about
        const innerLayerParentURL = String((innerPageURL.replace(/\/[^\/]*$/, '')).match(/[^\/]*$/))
        if ((innerLayerNumber - outerLayerNumber) === 1){
            console.log(outerLayerNumber,innerLayerNumber,outerLayerEndURL,innerLayerParentURL)
        }

        // check the parent layer level is 1 lower than the child
        // check the parent name is really the name before child 
        if (
            ((innerLayerNumber - outerLayerNumber) === 1)
            && innerLayerParentURL === outerLayerEndURL){
                return true
            }

        return match
    }

    getLayer(url){
        // remove the protocol as it contains two forward slashes
        url = url.replace(/http:\/\/|https:\/\//g, '')

        // find the total forward slashes, if none 0
        const count = (url.match(/\//g) || []).length
        // TODO check if anything nothing follows the last "/" when the count is 0 aka home page case
        if (count === 1){
            // error handling possibilities unknown atm
            return 1
        }
        return count
    }

    sanitizeTitle(title){
        title = String(title.replace(/\'/g, `\\'`))
        title = String(title.replace(/\"/g, `\\"`))
        return title
    }

    // regex a url to remove the domain, so key lookup is a tiny bit faster and less cluttered
    removeDomainFromURL = (url) => {
        // console.log(url);
        return url.replace(this.domainHome, '')
    }

    // check if a url is already in the tracking oject
    // returns true or false
    async isURLNewNode(url) {
        const name = this.removeDomainFromURL(url)
        let newNode = false
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (page:Page {name: '${name}'})
                RETURN page AS page`)
            .then(result => {
                const status = result.records[0].get('page')
                if (status === null){
                    newNode = true
                }
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                
            }) 
        return newNode 
    }


    async pageSanitized(url){
        const name = this.removeDomainFromURL(url)
        let sanitized = false
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (page:Page {name: '${name}'})
                RETURN page.sanitized AS sanitized`)
            .then(result => {
                if (result.records[0].get('sanitized') === true){
                    sanitized = true
                }
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                
            }) 
        // console.log(sanitized)
        return sanitized
    }

    logError(error, url){
        console.log(url, error)        
        // setTimeout( () => {
        //     console.log(error)
        //     console.log(`5s pass`)
        // }, 5000);
    }

}
module.exports = DatabaseAccessor