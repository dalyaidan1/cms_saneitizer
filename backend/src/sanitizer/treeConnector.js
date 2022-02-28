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
                let stripedURL = stripURLLayerBy(childLayerNodes[childNode].url, layer-1)
                if (await databaseAccessor.isURLNewNode(stripedURL)){
                    // await databaseAccessor.
                    // make new Page or Directory Node from "/" to end of striped URL
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                } else {
                    // set it as a parent of the childLayerNodes[childNode].url and vice-versa
                }
            }

            if (layer-1 !== 0){
                return parseCurrentLayer(layer-1)
            }
            return true
        }
        return parseNodes(startLayer)
    }
}

module.exports = {
    connectLayers
}