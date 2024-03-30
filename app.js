const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

const v1 = require('./router/v1/index.js')
app.use('/v1', v1)

app.listen(port, () => {
    console.log(`App Running on port : ${port}`)
})