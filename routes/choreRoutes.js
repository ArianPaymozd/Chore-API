const router = require("express").Router()
const pool = require("../db")
const authorization = require("../middleware/authorization")

router.post('/:house_id/create-chore', authorization, async (req, res) => {
    try {
        const { house_id } = req.params;
        const { description } = req.body
        //create chore
        const newChore = await pool.query("INSERT INTO chore_chores (house_id, description, done) VALUES ($1, $2, 'no') RETURNING *", [house_id, description])
        //return chore
        return res.json(newChore.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

router.post('/:chore_id/take-chore', authorization, async (req, res) => {
    try {
        const { chore_id } = req.params
        const assignedChore = await pool.query("UPDATE chore_chores SET assigned = $1 WHERE id = $2 RETURNING *", [req.user, chore_id])
        return res.json(assignedChore.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

router.post('/:chore_id/finish-chore', authorization, async (req, res) => {
    try {
        const { chore_id } = req.params
        const finishedChore = await pool.query("UPDATE chore_chores SET done = 'yes' WHERE id = $1 RETURNING *", [chore_id])
        res.json(finishedChore.rows[0])
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

router.delete('/:chore_id/delete-chore', authorization, async (req, res) => {
    try {
        const { chore_id } = req.params
        const deletedChore = await pool.query("DELETE FROM chore_chores WHERE id = $1 RETURNING *", [parseInt(chore_id)])
        return res.json(deletedChore.rows[0])
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
})

router.get('/:house_id', authorization, async (req, res) => {
    try {
        const { house_id } = req.params
        const chores = await pool.query("SELECT * FROM chore_chores WHERE house_id = $1", [house_id])
        if (!chores.rows.length) return res.json([])
        res.json(chores.rows)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router