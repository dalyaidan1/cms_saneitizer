# CMS_San(e)itizer
As the modern era increasingly embraces and relies on the internet, more users expect a clean and easy to traverse schema in the websites they use. Websites that are not incubated in a competitive market, often have high complexity but low navigability and a limited schema. This leads to a poor user experience for developers and end-users. To solve this imbalance, an algorithmic tool was developed to scrape an entire website regardless of its presented navigation, detect pages hidden through the misuse of common web technologies, unify and sanitize its html schema in favor of readability, and enforce a navigation tree based on the websites true structure. The produced copy of a website will be able to be used as either a mirror site to understand its structure and make it easier to navigate or as a boilerplate template to import into a new a Content Management System, satisfying both developers and end-users

## Legal Disclaimer
When using this software, it is important to get EXPRESS PERMISSION from the owner and host of the site that will be scraped. This software will submit a large number of requests to a website in a short time and can easily be mistaken for a distributed denial of service (DDOS) attack. Aidan Daly does not condone and is not liable for any use of this software unless the intended parties in charge of the target website have agreed to it.

## Setup
To setup the app, two other instances are needed:
1. A Neo4j Database
2. A React frontend

### Neo4j
There are three options for Neo4j from here: https://neo4j.com/try-neo4j/
1. Use Neo4j Desktop (easiest): With this you just download, install and manage a new database to use
2. Use Neo4j Community Server: With this you download, unpack in the app root, and then run `<folderOfDB>/bin/neo4j console` in a terminal. The database can then also be managed on: http://localhost:7474/browser/ 
3. Use Neo4j Sandbox. An online sever, follow the step on Neo4js website

### React
The front end for this app can be run locally or from a deployment on Netlify.

To use Netlify, simply use https://cms-saneitizer.netlify.app 

To run locally, Make sure *npm* is installed navigate to the front_end folder.
1. Here create a `.env` file with:
`REACT_APP_BACKEND_URL=http://localhost:5000`

2. Next in a terminal and run:
   1. `npm install`
   2. `npm start`

### Running the Node

Now that both the front-end and database are running there are two more pieces of setup:
1. 1. Here create a `.env` file with:
```
FRONT_END_URL=<http://localhost:3000 OR https://cms-saneitizer.netlify.app>
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=<your_database_user_name>
NEO4J_PASSWORD=<your_database_user_password>
BACK_END_PORT=5000
```
2. In the root folder run:
   1. `npm install`
   2. `npm start`

