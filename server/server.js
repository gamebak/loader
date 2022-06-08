const express = require("express")
const cors = require('cors')
const terms = require('./terms.json')
const path = require('path')

const PORT = 8080
const app = express()

app.use("/public", express.static(path.resolve(__dirname, 'public')))
app.use(cors())
  .get('/', async (_, res) => {
    res.send('<html><h2>Main server running</h2></html>').status(200)
  })
  .get("/terms", async (_, res) => {
    try {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(terms)).status(200)
    } catch (e) {
      res.send('Error!').status(500)
    }
  })
  .listen(PORT, () => {
    console.log(`The server is listening on http://localhost:${PORT}/`)
  })