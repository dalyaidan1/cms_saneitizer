const neo4j = require('neo4j-driver')

function stripURLLayerBy(url, number){
    // subtract 2 to account for http:// 
    const count = (url.match(/\//g) || []).length - 2

    if (count === number){
        return url
    }
    url = String(url.replace(/(\/[^\/]*$)/, ''))
    return stripURLLayerBy(url, number)
}

const connectLayers = {
    async parseLayers(databaseAccessor) {
        console.log("Starting Final Connections......")
        const startLayer = await databaseAccessor.getMaxLayer();
        async function parseCurrentLayer(layer){
            const childLayerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
            // cant do this because it would needed to be updated every round
            // const parentLayerNodes = await databaseAccessor.getAllNodesFromLayer(layer - 1)

            // const childNodeURLs = childLayerNodes.map(node => node.url)
            for (let childNode in childLayerNodes){
                let parentURL = stripURLLayerBy(childLayerNodes[childNode].properties.url, layer-1)
                if (await databaseAccessor.isURLNewNode(parentURL)){
                    // make new Directory Node from "/" to end of stripped URL                    
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                    await databaseAccessor.
                        setNewDirectoryNodeFromURL(
                            childLayerNodes[childNode].properties.url, parentURL)
                } else {
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                        await databaseAccessor.
                            updateNodeRelationship(
                                childLayerNodes[childNode].properties.url, parentURL)
                }
            }

            if (layer-1 !== 0){
                return parseCurrentLayer(layer-1)
            }
            return true
        }
        return parseCurrentLayer(startLayer)
    }
}

module.exports = connectLayers