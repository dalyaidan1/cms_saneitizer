const neo4j = require('neo4j-driver')

function stripURLLayerBy(url, number){
    const count = (url.match(/\//g) || []).length
    if (count === number){
        return url
    }
    url = String(url.replace(/([^\/]*$)/, ''))
    return stripURLLayerBy(number, url)
}

const connectLayers = {
    async parseLayers(databaseAccessor) {
        const startLayer = (await databaseAccessor.getLowestNode()).layer
        async function parseCurrentLayer(layer){
            const childLayerNodes = await databaseAccessor.getAllNodesFromLayer(layer)
            // cant do this because it would needed to be updated every round
            // const parentLayerNodes = await databaseAccessor.getAllNodesFromLayer(layer - 1)

            // const childNodeURLs = childLayerNodes.map(node => node.url)
            for (let childNode in childLayerNodes){
                let parentURL = stripURLLayerBy(childLayerNodes[childNode].url, layer-1)
                if (await databaseAccessor.isURLNewNode(parentURL)){
                    // make new Directory Node from "/" to end of stripped URL                    
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                    await databaseAccessor.setNewDirectoryNodeFromURL(childLayerNodes[childNode].url, parentURL)
                } else {
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                    if (await databaseAccessor.getNodeTypeFromURL(parentURL) === "Page"){
                        await databaseAccessor.
                            updatePageNodeRelationship(
                                childLayerNodes[childNode].url, parentURL)
                    } else {
                        await databaseAccessor.
                            updateDirectoryNodeRelationship(
                                childLayerNodes[childNode].url, parentURL)
                    }
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

module.exports = {
    connectLayers
}