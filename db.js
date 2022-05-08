const Pool = require("pg").Pool
const pool = new Pool({
    user: "postgres",
    password: "superoreo1",
    port: 5432,
    database: "chore"
})

module.exports = pool