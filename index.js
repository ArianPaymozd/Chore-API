const express = require("express")
const app = express()
const cors = require("cors")

app.use(express.json())
app.use(cors())

app.use("/auth", require("./routes/jwtAuth"))
app.use("/home", require("./routes/homeRoutes"))
app.use("/chore", require("./routes/choreRoutes"))

app.listen(5000, () => {
    console.log('server has')
})