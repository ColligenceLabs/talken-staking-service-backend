const express = require("express")
const health = new express.Router()

health.get("/", (req, res) => res.send("OK"))

module.exports = health
