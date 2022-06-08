## Project structure

The project consists of 2 main modules:
- `node.js` backend:
    - Express server listening on `http://127.0.0.1:8080`
    - Stores external files such as JSON, CSS, JS script
    - CORS enabled to allow js file to load data
- front-end running:
    - Index.js simulates how code will be injected and loaded

## Project Setup
```sh
cd server; 
npm install;
npm run server;
```

## Generated external links (CORS enabled)
```sh
# The main loader that will be installed in CMS
- http://localhost:8080/public/loader.js

# API call on search
- http://localhost:8080/terms

# Custom CSS for our widget that is imported
- http://localhost:8080/public/loader.css
```

## How to install the loader in any page
```javascript
/**
 * data-search - id of the search button from the main page
 * data-result - the textarea where the results will be added
*/
<script type="text/javascript" src="http://localhost:8080/public/loader.js" data-search="btnSearch" data-result="result"
  id="searchLoader"></script>
```