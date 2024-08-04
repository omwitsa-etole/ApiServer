const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')

router.get('/getNotifications', auth, async (req, res) => {
	try {
		const results = {}
		const notifications = await Notification.find({ user:req.user.id })
		results.notifications = notifications
		return res.status(200).json(results)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server Error='+error.message)
	}
})

router.delete('/deleteNotification/:id', auth, async (req, res) => {
try {
	const notid = req.params.id
	const notification = await Notification.findById(notid)
	if(notification.user.toString() !== req.user.id){
		return res.status(401).json({message:"Anauthorised request"})
	}
	const results = await Notification.findByIdAndRemove(notid)
	
	return res.status(200).json({message:"Success"})
} catch (error) {
	console.error(error.message)
	res.status(500).send('Server Error='+error.message)
}
})


router.get('/getSaved', auth, async (req, res) => {
  try {
	const userid = req.user.id
	const result = {}
   
    return res.status(200).json(result)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error='+error.message)
  }
})

router.get('/getDetails', auth, async (req, res) => {
  try {
	const userid = req.user.id
	const detail = {}
	
    return res.status(200).json(detail)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error='+error.message)
  }
})

//@route GET api/models/users
//@description Get user Payment
//@access Private

router.get('/getPayments', auth, async (req, res) => {
  try {
	const userid = req.user.id
	const result = {}
    //const payments  = await Payment.find({user:userid})
	result.payments = payments
    return res.status(200).json(result)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error='+error.message)
  }
})


module.exports = router