const router = require("express").Router()
const pool = require("../db")
const bcrypt = require("bcrypt")
const authorization = require("../middleware/authorization")


router.post('/create-home', authorization, async (req, res) => {
    try {
        const user_id = req.user
        const {name, password} = req.body
        //create house in database
        const saltRound = 10

        const salt = await bcrypt.genSalt(saltRound)

        const bcryptPassword = await bcrypt.hash(password, salt)

        const newHouse = await pool.query("INSERT INTO chore_houses (name, password, members) VALUES ($1, $2, $3) RETURNING *", [name, bcryptPassword, [user_id]])
        //add house to users house array
        const user = await pool.query("UPDATE chore_users SET houses = array_append(houses, $1) WHERE id = $2 RETURNING *", [newHouse.rows[0].id, user_id])
        //add user to houses members
        //send the created house
        res.json(newHouse.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
    
})

router.post('/join-home', authorization, async (req, res) => {
    try {
        const user_id = req.user
        const { join_id, password } = req.body

        const house = await pool.query('SELECT * FROM chore_houses WHERE id = $1', [join_id])

        if (!house.rows.length) return res.status(401).json('Incorrect join ID')

        if (house.rows[0].members.includes(user_id)) return res.status(401).json("You've already joined this house")

        const validatePassword = await bcrypt.compare(password, house.rows[0].password)

        if (!validatePassword) return res.status(401).json('Incorrect Password')

        const updatedHouse = await pool.query('UPDATE chore_houses SET members = array_append(members, $1) WHERE id = $2 RETURNING *', [user_id, house.rows[0].id])

        res.json(updatedHouse.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

router.delete('/:house_id/delete-home', authorization, async (req, res) => {
    try {
        const { house_id } = req.params
        const { password } = req.body

        const house = await pool.query("SELECT * FROM chore_houses WHERE id = $1", [parseInt(house_id)])

        const validPassword = await bcrypt.compare(password, house.rows[0].password)

        if (!validPassword) res.status(401).send("Incorrect password")

        const deletedHouse = await pool.query("DELETE FROM chore_houses WHERE id = $1 RETURNING *", [parseInt(house_id)])

        for (let user of deletedHouse.rows[0].members) {
            pool.query("UPDATE chore_users SET houses = array_remove(houses, $1) WHERE id = $2", [parseInt(house_id), user])
        }
        return res.json(deletedHouse.rows[0])
        
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

router.get('/', authorization, async (req, res) => {
    try {
        const homes = await pool.query("SELECT * FROM chore_houses WHERE $1 = ANY(members)", [req.user])
        res.json(homes.rows)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

module.exports = router