class DatabaseAccessor {
    constructor(driver, domainHome){
        this.driver = driver
        this.sanitize = require('../sanitizer/pageSanitizer')
        this.helper = require('./databaseHelpers')
        this.neo4j = require('neo4j-driver')
        this.domainHome = domainHome
    }


    /**
     * Set or create something on the database
     * 
     * @param {String} cypher string literal of query to send to the database
     * @returns none
     */
    async writeOperation(cypher){
        let session = await this.driver.session()
        try{
            await session.writeTransaction(async txc => {
                let result = await txc
                    .run(cypher)
                return result
            })
            .catch(error => {
                console.log(error)
            })
            .then(async () => await session.close())
            return 
        } catch(error){
            console.log(error)
        }
    }

    /**
     * Get something on the database
     * 
     * @param {String} cypher string literal of query to send to the database
     * @returns result of cypher
     */
    async readOperation(cypher){
        let session = await this.driver.session()
        let data;
        try{
            await session.readTransaction(async txc => {
                let result = await txc
                    .run(cypher)
                return result
            })
            .then(result => {
                data = result                
            })
            .catch(error => {
                console.log(error)
            })
            .then(async () => await session.close())
            return data

        } catch(error){
            console.log(error)
            await session.close()
        }
    }

    /**
     * Insert a new Page node into the database
     * 
     * @param {Page} page 
     * @param {*} options 
     * @returns name of the inserted node
     */
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

        await this.writeOperation(
                `CREATE (page:Page {
                    name: '${name}',
                    id: randomUuid(),
                    url: '${url}',
                    layer: ${this.neo4j.int(layer)},
                    title: '${title}',
                    content: \'${content}\',
                    sanitized: ${sanitized},
                    shift_page: ${shift_page},
                    pre_shift_url: '${pre_shift_url}'
                })`)
        return name        
    }

    /**
     * Update an existing Page node into the database
     * 
     * @param {Page} page 
     * @returns name of the updated node
     */
    async updatePageNodeFromPage(page){
        const url = await page.url()
        
        const name = this.helper.formatPageName(url, this.domainHome)

        let pageMatch;

        // find the Page node with the matching name
        await this.readOperation(
                `MATCH (page:Page {name: '${name}'})
                RETURN page AS page`)
            .then(result => {
                if (result.records === []){
                    console.log(result)
                }
                pageMatch = result.records[0].get('page')                
            })
        
        // if page is not sanitized, it need to get updated
        if (!pageMatch.properties.sanitized){
            const title = this.helper.sanitizeTitle(await this.helper.getTitle(page))
            
            const content = this.sanitize(
                await page.$eval('body', content => content.outerHTML),
                this.domainHome
                )

            let sanitized = false

            if (content.length !== 0){
                sanitized = true
            }

            await this.writeOperation(
                `MATCH (page:Page {name: '${name}'})
                SET page.title = '${title}',
                    page.content = \'${content}\',
                    page.sanitized = ${sanitized}`
            )
        }            
        return page.name
    }

    /**
     * Set an initial Page node, with some missing properties
     * 
     * @param {String} url exact URL of the page to be inserted
     * @returns name of inserted node
     */
    async setNewPageNodeFromURL(url){
        const name = this.helper.formatPageName(url, this.domainHome)

        const layer = this.helper.getLayer(name)

        await this.writeOperation(
                `CREATE (page:Page {
                    name: '${name}',
                    id: randomUuid(),
                    url: '${url}',
                    layer: ${this.neo4j.int(layer)},
                    title: '',
                    content: '',
                    sanitized: false
                })`)        
        return name
    }

    /**
     * Set a new Directory node. Must have a child to be a valid directory
     * 
     * @param {String} childURL exact URL of the child 
     * @param {String} parentURL exact URL of the directory
     */
    async setNewDirectoryNodeFromURL(childURL, parentURL){
        const parentName = this.helper.removeDomainFromURL(parentURL, this.domainHome)
        const layer = this.helper.getLayer(parentName)

        await this.writeOperation(
                `CREATE (dir:Directory {
                    name: '${parentName}',
                    id: randomUuid(),
                    url: '${parentURL}',
                    layer: ${this.neo4j.int(layer)}
                })`)
        await this.updateNodeRelationship(childURL, parentURL)
    }

    
    /**
     * Set a new Redirect node
     * 
     * @param {String} startURL exact URL of the origin URL
     * @param {String} endURL exact URL of the destination URL 
     */
    async addRedirectNode(startURL, endURL){
        const startName = this.helper.formatPageName(startURL, this.domainHome)
        const endName = this.helper.formatPageName(endURL, this.domainHome)

        await this.writeOperation(
                `MATCH (endPage:Page {name: '${endName}'})
                CREATE (startPage:Redirects {
                    name: '${startName}',
                    sanitized: true,
                    layer: endPage.layer
                })-[:REDIRECTS]->(endPage)`
            )
    }

    /**
     * Get the highest layer number that any node has
     * @returns max layer number
     */
    async getMaxLayer(){
        let max = 0
        await this.readOperation(
                `MATCH (node) 
                RETURN toInteger(max(node.layer)) as layer
                `)
            .then(result => {
                max = result.records[0].get('layer').toNumber()
            })
        return max 
    }

    /**
     * Get all the nodes that contain a matching layer number in their properties
     * @param {Number} layer 
     * @returns all match nodes
     */
    async getAllNodesFromLayer(layer){
        let layers = []
        await this.readOperation(
                `MATCH (nodes)
                WHERE nodes.layer = ${this.neo4j.int(layer)}
                RETURN nodes`)
            .then(result => {
                layers = result.records.map(node => {
                    return node.get('nodes')
                })
            })
        return layers 
    }

    /**
     * Set a parent and child relationship between any kind of node and a Directory node
     * 
     * @param {String} childURL exact URL of the child 
     * @param {String} parentURL exact URL of the parent Directory
     */
    async updateNodeRelationship(childURL, parentURL){
        const childName = this.helper.formatPageName(childURL, this.domainHome)
        const parentName = this.helper.formatPageName(parentURL, this.domainHome)
        
        await this.writeOperation(
            `MATCH 
                (childNode),
                (parentNode:Directory)
            WHERE 
                childNode.name = '${childName}' 
                AND parentNode.name = '${parentName}'
            CREATE (childNode)-[:PARENT]->(parentNode),
                (parentNode)-[:CHILD]->(childNode)`
        )
    }

    /**
     * Update the title property of an existing Page node
     * 
     * @param {String} node id property of node
     * @returns true
     */
    async updateNodeTitle(node){
        await this.writeOperation(
            `MATCH (page:Page {id: '${node.id}'})
            SET page.title = '${node.title}'`
        )
        return true
    }

    /**
     * Get the initial label of a node
     * 
     * @param {String} url exact URL of node
     * @returns the first label on a node
     */
    async getNodeTypesFromURL(url){
        const name = this.helper.formatPageName(url, this.domainHome)
        let types = [""]

        await this.readOperation(
                `OPTIONAL MATCH (node {name: '${name}'})
                RETURN labels(node) AS labels`)
            .then(result => {
                types = result.records.map(label => {
                    return label.get('labels')[0]
                })
            })
        return types 
    }

    /**
     * Check if a node is already in the database
     * 
     * @param {String} url exact URL of node
     * @returns true or false
     */
    async isURLNewNode(url) {
        const name = this.helper.formatPageName(url, this.domainHome)
        let newNode = false
        await this.readOperation(
                `OPTIONAL MATCH (node {name: '${name}'})
                RETURN node AS node`)
            .then(result => {
                const status = result.records[0].get('node')
                if (status === null || status === 0){
                    newNode = true
                }
            })
        return newNode 
    }

    /**
     * Check if a nodes sanitized property is true or false
     * 
     * @param {String} url exact URL of node
     * @returns true or false
     */
    async pageSanitized(url){
        const name = this.helper.formatPageName(url, this.domainHome)
        let sanitized = false
        await this.readOperation(
                `OPTIONAL MATCH (page {name: '${name}'})
                RETURN page.sanitized AS sanitized`)
            .then(result => {
                if (result.records[0].get('sanitized') === true){
                    sanitized = true
                }
            })
        return sanitized
    }

    /**
     * Get all the nodes one child layer down from a node
     * 
     * @param {String} nodeName formatted name property of node
     * @returns list of nodes
     */
    async getNodeChildren(nodeName){
        let children
        await this.readOperation(
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
        return children
    }

}
module.exports = DatabaseAccessor