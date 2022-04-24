/**
 * Strip a name back by a certain number of layers
 * 
 * @param {String} name name to strip
 * @param {Number} number how many layers to strip the name
 * @returns substring of name
 */
function stripNameLayerBy(name, number){
    // subtract 2 to account for http:// 
    const count = (name.match(/\//g) || []).length

    if (count === number){
        return name
    }
    name = String(name.replace(/(\/[^\/]*$)/, ''))
    return stripNameLayerBy(name, number)
}

const connectLayers = {
    /**
     * Connect all of the layers to form a tree
     * 
     * @param {DatabaseAccessor} databaseAccessor 
     * @returns none
     */
    async parseLayers(databaseAccessor) {
        console.log("Starting Final Connections......")
        // bottom up
        const startLayer = await databaseAccessor.getMaxLayer();
        /**
         * Put all the nodes on a layer into a tree
         * 
         * @param {Number} layer layer to be operated on
         * @returns true when finished a layer
         */
        async function parseCurrentLayer(layer){
            const childLayerNodes = await databaseAccessor.getAllNodesFromLayer(layer)

            for (let childNode in childLayerNodes){
                let parentURL = stripNameLayerBy(childLayerNodes[childNode].properties.name, layer-1)
                if (await databaseAccessor.isURLNewNode(parentURL)){
                    // make new Directory Node from "/" to end of stripped URL                    
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                    await databaseAccessor.
                        setNewDirectoryNodeFromURL(
                            childLayerNodes[childNode].properties.url, parentURL)
                } else {
                    // cases where a there is a page under another page directly
                    if (!((await databaseAccessor.getNodeTypesFromURL(parentURL)).includes("Directory"))){
                        await databaseAccessor.
                            setNewDirectoryNodeFromURL(
                                childLayerNodes[childNode].properties.url, parentURL)
                    } else{
                        // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                        await databaseAccessor.
                            updateNodeRelationship(
                                childLayerNodes[childNode].properties.url, parentURL)
                    }   
                }
            }
            // if not at the top of the tree yet
            if (layer-1 !== 0){
                return parseCurrentLayer(layer-1)
            }
            return true
        }
        return parseCurrentLayer(startLayer)
    }
}

module.exports = connectLayers