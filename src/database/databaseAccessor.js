class DatabaseAccessor {
    constructor(driver, domainHome){
        this.driver = driver
        this.sanitize = require('../sanitizer/pageSanitizer')
        this.helper = require('./databaseHelpers')
        this.neo4j = require('neo4j-driver')
        this.domainHome = domainHome
    }

    async setNewPageNodeFromPage(page, options={}){
        const url = options["url"] === undefined
            ? await page.url()
            : options["url"]

        const name = options["name"] === undefined
            ?  this.helper.formatPageName(url, this.domainHome)
            :  this.helper.formatPageName(options["name"], this.domainHome)

        const layer = options["layer"] === undefined
            ? this.helper.getLayer(name)
            : options["layer"]

        const title = options["title"] === undefined
            ? this.helper.sanitizeTitle(await this.helper.getTitle(page))
            : this.helper.sanitizeTitle(options["title"])

        const content = options["content"] === undefined 
            ? this.sanitize( 
                await page.$eval('body', content => content.outerHTML),
                this.domainHome)
            : this.sanitize(options["content"], this.domainHome)
        
        let sanitized = false
        if (content.length !== 0){
            sanitized = true
        }

        const shift_page = options["shift_page"] === undefined
            ? false
            : true

        const pre_shift_url = options["pre_shift_url"] === undefined
            ? url
            : options["pre_shift_url"]

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
                    occurrences: $occurrences,
                    shift_page: ${shift_page},
                    pre_shift_url: '${pre_shift_url}'
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
        
        const name = this.helper.formatPageName(url, this.domainHome)

        let pageMatch;

        let session = await this.driver.session()
        // get the node already in the db
        await session
            .run(
                `MATCH (page:Page {name: '${name}'})
                RETURN page AS page`)
            .then(async result => {
                if (result.records === []){
                        console.log(result)
                }
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
        if (pageMatch.properties.sanitized){
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
            const title = this.helper.sanitizeTitle(await this.helper.getTitle(page))
            const content = this.sanitize(
                await page.$eval('body', content => content.outerHTML),
                this.domainHome
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

        const name = this.helper.formatPageName(url, this.domainHome)

        const layer = this.helper.getLayer(name)

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
                const outerPageName = this.helper.formatPageName(outerPageURL, this.domainHome)
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
                            (outerPage)-[:CHILD]->(innerPage)
                        `
                    )
                    .catch(error => {
                        this.logError(error, url);
                    })
                } 
                // else {
                //     await session2.run(
                //         `MATCH 
                //             (innerPage:Page),
                //             (outerPage:Page)
                //         WHERE 
                //             innerPage.name = '${name}'
                //             AND outerPage.name = '${outerPageName}'
                //         CREATE (outerPage)-[:LINKS_TO]->(innerPage)`
                //     )
                //     .catch(error => {
                //         this.logError(error, url);
                //     })
                // }
                await session2.close()                    
            } 
        return name
    }

    async updatePageNodeOccurrences(url, outerPageURL = null){
        const name = this.helper.formatPageName(url, this.domainHome)
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
            // if (outerPageURL !== null){
            //     let session2 = await this.driver.session()
            //     const outerPageName = this.helper.removeDomainFromURL(outerPageURL, this.domainHome)
            //     await session2.run(
            //         `MATCH 
            //             (innerPage:Page),
            //             (outerPage:Page)
            //         WHERE 
            //             innerPage.name = '${name}' 
            //             AND outerPage.name = '${outerPageName}'
            //         CREATE (outerPage)-[:LINKS_TO]->(innerPage)
            //         `
            //     )
            //     .catch(error => {
            //         this.logError(error, url);
            //     })
            //     await session2.close()
            // } 
    }

    async setNewDirectoryNodeFromURL(childURL, parentURL){
        const parentName = this.helper.removeDomainFromURL(parentURL, this.domainHome)
        const layer = this.helper.getLayer(parentName)

        let session = await this.driver.session()
        // set the page props
        await session
            .run(
                `CREATE (dir:Directory {
                    name: '${parentName}',
                    id: randomUuid(),
                    url: '${parentURL}',
                    layer: $layer
                })`, {
                    layer: this.neo4j.int(layer)
            })
            .catch(error => {
                this.logError(error, childURL);
            })
            .then(async () => {
                await session.close()                                               
            })
        await this.updateNodeRelationship(childURL, parentURL)
    }

    async convertPageNodeToRedirectFromURL(startURL, endURL){
        const startName = this.helper.formatPageName(startURL, this.domainHome)
        const endName = this.helper.formatPageName(endURL, this.domainHome)

        let session = await this.driver.session()
        // set the page props
        await session
            .run(
                `MATCH (startPage:Page {name: '${startName}'}),
                (endPage:Page {name: '${endName}'})
                REMOVE startPage:Page
                SET startPage:Redirect,
                startPage.sanitized = true
                CREATE (startPage)-[:REDIRECTS]->(endPage)`
            )
            .catch(error => {
                this.logError(error, startURL);
            })
            .then(async () => {
                await session.close()                                               
            })
    }

    async addRedirectNode(startURL, endURL){
        const startName = this.helper.formatPageName(startURL, this.domainHome)
        const endName = this.helper.formatPageName(endURL, this.domainHome)

        let session = await this.driver.session()
        // set the page props
        await session
            .run(
                `MATCH (endPage:Page {name: '${endName}'})
                CREATE (startPage:Redirects {
                    name: '${startName}',
                    sanitized: true,
                    layer: endPage.layer
                })-[:REDIRECTS]->(endPage)`
            )
            .catch(error => {
                this.logError(error, startURL);
            })
            .then(async () => {
                await session.close()                                               
            })
    }


    async getMaxLayer(){
        let max = 0
        let session = await this.driver.session()
        await session
            .run(
                `MATCH (node) 
                RETURN toInteger(max(node.layer)) as layer
                `)
            .then(result => {
                max = result.records[0].get('layer').toNumber()
            })
            .catch(error => {
                this.logError(error);
            })
            .then(async () => {
                await session.close()                
            }) 
        return max 
    }

    async getAllNodesFromLayer(layer){
        let layers = []
        let session = await this.driver.session()
        await session
            .run(
                `MATCH (nodes)
                WHERE nodes.layer = $layerNumber
                RETURN nodes`, {
                    layerNumber: this.neo4j.int(layer)
                })
            .then(result => {
                layers = result.records.map(node => {
                    return node.get('nodes')
                })
            })
            .catch(error => {
                this.logError(error);
            })
            .then(async () => {
                await session.close()                
            }) 
        return layers 
    }


    async updateNodeRelationship(childURL, parentURL){
        const childName = this.helper.formatPageName(childURL, this.domainHome)
        const parentName = this.helper.formatPageName(parentURL, this.domainHome)
        let session = await this.driver.session()
        await session.run(
            `MATCH 
                (childNode),
                (parentNode:Directory)
            WHERE 
                childNode.name = '${childName}' 
                AND parentNode.name = '${parentName}'
            CREATE (childNode)-[:PARENT]->(parentNode),
                (parentNode)-[:CHILD]->(childNode)`
        )
        .catch(error => {
            this.logError(error, childURL);
        })
        .then(async () => {
            await session.close()
        })
    }

    async getNodeTypesFromURL(url){
        const name = this.helper.formatPageName(url, this.domainHome)
        let types = [""]
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (node {name: '${name}'})
                RETURN labels(node) AS labels`)
            .then(result => {
                types = result.records.map(label => {
                    return label.get('labels')[0]
                })
            })
            .catch(error => {
                this.logError(error, url);
            })
            .then(async () => {
                await session.close()                
            }) 
        return types 
    }

    // check if a url is already in the tracking oject
    // returns true or false
    async isURLNewNode(url) {
        const name = this.helper.formatPageName(url, this.domainHome)
        let newNode = false
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (node {name: '${name}'})
                RETURN node AS node`)
            .then(result => {
                const status = result.records[0].get('node')
                if (status === null || status === 0){
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
        const name = this.helper.formatPageName(url, this.domainHome)
        let sanitized = false
        let session = await this.driver.session()
        await session
            .run(
                `OPTIONAL MATCH (page {name: '${name}'})
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

    async getNodeChildren(nodeName){
        let session = await this.driver.session()
        let children
        await session
            .run(
                `OPTIONAL MATCH (p)-[:CHILD]->(c) 
                WHERE p.name = "${nodeName}" 
                RETURN c`)
            .then(result => {
                if (result !== null){
                    children = result.records.map(node => {
                        return node.get('c')
                    })
                }
            })
            .catch(error => {
                this.logError(error, nodeName);
            })
            .then(async () => {
                await session.close()                
            }) 
        return children
    }

    logError(error, url){
        console.log(url, error)        
        // setTimeout( () => {
        //     console.log(error)
        //     console.log(`5s pass`)
        // }, 5000);
        process.exit()
    }

}
module.exports = DatabaseAccessor