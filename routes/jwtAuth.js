const router = require("express").Router()
const pool = require("../db")
const bcrypt = require("bcrypt")
const jwtGenerator = require("../utils/jwtGenerator")
const authorization = require("../middleware/authorization")
const validInfo = require("../middleware/validInfo")

router.post("/register", validInfo, async (req, res) => {
    try {
        const { name, email, password } = req.body
        const user = await pool.query("SELECT * FROM chore_users WHERE email = $1", [email])

        if (user.rows.length) return res.status(401).send("Email already used")

        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)

        const bcryptPassword = await bcrypt.hash(password, salt)

        const newUser = await pool.query("INSERT INTO chore_users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, bcryptPassword])

        const token = jwtGenerator(newUser.rows[0].id)

        res.json({ token })

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }

})

router.post("/login", validInfo, async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await pool.query("SELECT * FROM chore_users WHERE email = $1", [email])

        if (!user.rows.length) res.status(401).send("No account with that email was found")

        const validPassword = await bcrypt.compare(password, user.rows[0].password)

        if (!validPassword) res.status(401).send("Incorrect password")

        const token = jwtGenerator(user.rows[0].id)

        res.json(token)
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

router.get("/verify", authorization, (req, res) => {
    try {
        res.json('true')
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

module.exports = router