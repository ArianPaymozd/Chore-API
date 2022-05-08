const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()

app.use(express.json())
app.use(cors())
app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })

app.use("/auth", require("./routes/jwtAuth"))
app.use("/home", require("./routes/homeRoutes"))
app.use("/chore", require("./routes/choreRoutes"))
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log("server has started")
})