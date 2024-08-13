const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')

const Notification = require("../models/Notification")

router.get('/:id', auth, async (req, res) => {
  try {
	const userid = req.params.id
    const user = await User.findById(userid).select("-password")
	
    return res.status(200).json(user)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

router.post('/reset', async (req, res) => {
  const { email, password} = req.body
  const userFields = {}
  if (password){
	const salt = await bcrypt.genSalt(10)
	userFields.password = await bcrypt.hash(password, salt)
  }
  

  try {
	
	
    let user = await User.findOne({email})

    if (!user) return res.status(404).json({ message: 'User not found' })
	
	
    user = await User.findByIdAndUpdate(
      user.id,
      { $set: userFields },
      { new: true },
    )

    return res.status(200).json({ message: 'Password changed success' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

router.post("/me",auth,async (req,res)=>{
	try{
		const result = {}
		const user = User.findById(req.user.id).populate('subscription');
		result.user = user;
		return result;
	}catch(err){
		
	}
})


//@route Post api/users/Update
//@description Update a user
//@access Private

router.post('/update', auth, async (req, res) => {
  const { name, email, phone,password } = req.body

  // Build user object
  const userFields = {}
  if (name) userFields.name = name
  if (email) userFields.email = email
  if (phone) userFields.phone = phone
  
  
  if (password){
	const salt = await bcrypt.genSalt(10)
	userFields.password = await bcrypt.hash(password, salt)
  }

  try {
	
	
    let user = await User.findById(req.user.id)

    if (!user) return res.status(404).json({ message: 'User not found' })
		
	if(user.email !== email){
		let found = await User.findOne({email})
		if (found) return res.status(404).json({ message: 'User with email exists' })
	}
	  const notification = new Notification()
		notification.description = `New Profile Update`
		notification.user = req.user.id
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true },
    ).select('-password');
    await notification.save()
    return res.status(200).json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})


//@route POST api/users
//@description Register a User
//@access Public

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
	//check('phone', '10 digit Phone number is required').isLength({ min: 9 }),
    check('email', 'Please include a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 4 or more characters',
    ).isLength({ min: 4 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: errors.array()[0].msg })
    }

    const { name, email, password } = req.body
	
    try {
      let user = await User.findOne({ email })

      if (user) {
        return res.status(400).json({ message: 'User Already Exits' })
      }
	  
	   const userFields = {}
	  if (name) userFields.name = name
	  if (email) userFields.email = email
	  //if (phone) userFields.phone = phone
	  
      
      const salt = await bcrypt.genSalt(10)
	  if (password) userFields.password =await bcrypt.hash(password, salt)
	  user = new User(userFields)
	  await user.save()
	  const notification = new Notification()
		notification.description = `Created new WePark Account`
		notification.user = user._id
    await notification.save()
      const payload = {
        user: {
          id: user.id,
        },
      }
		
      jwt.sign(
        payload,
        config.jwtSecret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err
          res.json({ token, payload:payload.user,messsage:"Account Creation Successfull"})
        },
      )
    } catch (error) {
      console.log(error.message)
      res.status(500).send('Server Error')
    }
  },
)


router.delete('/:id', auth, async (req, res) => {
  try {
    let hostel = await User.findById(req.params.id)

    if (!hostel) return res.status(404).json({ message: 'User not found' })

    
    if(hostel._id.toString()!==req.user.id){
      return res.status(401).json({message:"Could not authorize your request"})
    }
    await User.findByIdAndRemove(req.params.id)
	const bookings = await Book.find({user:hostel._id})
	for(let i =0;i<bookings.length;i++){
		await Book.findByIdAndRemove(bookings[i]._id)
	}

    return res.status(200).json({ message: 'User removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
