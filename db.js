const Pool = require("pg").Pool
require("dotenv").config()
const connectionString = process.env.DATABASE_URL
const pool = new Pool({
    connectionString
    // user: "postgres",
    // password: "superoreo1",
    // port: 5432,
    // database: "chore"
})

module.exports = pool