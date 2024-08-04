const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')
const admin= require('../middlewares/admin')
const Notification = require('../models/Notification')


const urli = ""
//api/trannsaction/

router.get('/token', async (req, res) => {
  try {
	console.log(req.body)
	let re =  unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
	.headers({ 'Authorization': 'Basic cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ' })
	.send()
	.end(ress => {
		if (ress.error) res.status(401).json({message:ress.error})
		re = ress.toJSON()
		return res.status(200).json(re.body);
	});
    return res.status(200).json(req.body)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})


router.get('/success', async (req, res) => {
  try {
	console.log(req.body)
    return res.status(200).json({message:"Request captured",data:req.body})
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

router.get('/confirm', async (req, res) => {
  try {
	console.log(req.body)
    return res.status(200).json(req.body)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router