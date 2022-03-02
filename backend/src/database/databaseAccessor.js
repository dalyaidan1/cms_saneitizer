class DatabaseAccessor {
    constructor(driver, domainHome){
        this.driver = driver
        this.sanitize = require('../sanitizer/pageSanitizer')
        this.helper = require('./databaseHelpers')
        this.neo4j = require('neo4j-driver')
        this.domainHome = domainHome
    }

    async setNewPageNodeFromPage(page){	
        const url = await page.url()

        const name = this.helper.removeDomainFromURL(url, this.domainHome)

        const layer = this.helper.getLayer(url)

        const title = this.helper.sanitizeTitle(await page.title())

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
                    layer: this.neo4j.int(layer),
                    occurrences: this.neo4j.int(1)
                })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                                
            })
        return name        
    }

    async updatePageNodeFromPage(page){
        const url = await page.url()

        const name = this.helper.removeDomainFromURL(url, this.domainHome)

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
                    occurrences: this.neo4j.int(pageMatch.occurrences + 1)
                }
            )
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => await session2.close())
        } else {
            // if not, need to update it
            const title = this.helper.sanitizeTitle(await page.title())
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
                    occurrences: this.neo4j.int(pageMatch.occurrences + 1)
                }
            )
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => await session2.close() )
        }            
        return page.name
    }

    async setNewPageNodeFromURL(url, outerPageURL = null){
        // const url = await page.url()

        const name = this.helper.removeDomainFromURL(url, this.domainHome)

        const layer = this.helper.getLayer(url)

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
                    layer: this.neo4j.int(layer),
                    occurrences: this.neo4j.int(1)
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                                               
            })
            // if setting an inner page
            if (outerPageURL !== null){
                const outerPageName = this.helper.removeDomainFromURL(outerPageURL)
                let session2 = await this.driver.session()
                if (this.helper.layerIsAChildOfOtherLayer(url, outerPageURL)){
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

    async updatePageNodeOccurrences(url, outerPageURL = null){
        const name = this.helper.removeDomainFromURL(url, this.domainHome)
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
                const outerPageName = this.helper.removeDomainFromURL(outerPageURL)
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

    // check if a url is already in the tracking oject
    // returns true or false
    async isURLNewNode(url) {
        const name = this.helper.removeDomainFromURL(url, this.domainHome)
        let newNode = false
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (node {name: '${name}'})
                RETURN node AS node`)
            .then(result => {
                const status = result.records[0].get('node')
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
        const name = this.helper.removeDomainFromURL(url, this.domainHome)
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