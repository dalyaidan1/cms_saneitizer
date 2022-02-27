const neo4j = require('neo4j-driver')
require('dotenv').config()

const {
  NEO4J_URI,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
} = process.env

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
)

driver.verifyConnectivity()
  // Resolve with an instance of the driver
  .then(() => console.log("DB Connected"))

module.exports = driver