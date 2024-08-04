const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')


//@route PosT api/models/admin2
//@description admin2 scans bookingticket
//@access Private

router.post("/createCompany",
  [
    check('name', 'Name is required').not().isEmpty(),
	check('phone', '10 digit Phone number is required').isLength({ min: 9 }),
    check('email', 'Please include a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 4 or more characters',
    ).isLength({ min: 4 }),
  ],
  async (req, res) => {
  console.log(req.body)
  const {name,email,phone,password}= req.body
  try {
      let user = await User.findOne({ email })

      if (user) {
        return res.status(400).json({ message: 'User Already Exits' })
      }
	  user = await User.findOne({ phone })

      if (user) {
        return res.status(400).json({ message: 'User Already Exits' })
      }
	   const userFields = {}
	  if (name) userFields.name = name
	  if (email) userFields.email = email
	  if (phone) userFields.phone = phone
	  
      
      const salt = await bcrypt.genSalt(10)
	  if (password) userFields.password =await bcrypt.hash(password, salt)
	  user = new User(userFields)
	  user = await user.save()
	  
		res.status(200).json({message:"Account Creation successfull",data:user,next:"login"})
	  
    } catch (error) {
      console.log(error.message)
      res.status(500).send('Server Error')
    }
})




module.exports = router