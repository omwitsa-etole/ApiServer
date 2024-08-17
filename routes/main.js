const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')
const multer = require("multer");
const Tools = require("../models/Tools")
const Requests = require("../models/RequestsTool")
const Subscription = require("../models/Subscription")
const Invoice = require("../models/Invoice")
const Notification = require("../models/Notification")
const Upload = require("../models/Uploads")

const upload = multer({ dest: 'files/uploads/' });
//const {formidable} = require('formidable');

function isDateInCurrentWeek(date) {
    // Ensure the input is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    // Get the current date
    const now = new Date();

    // Calculate the start of the current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay(); // 0 (Sunday) through 6 (Saturday)
    const diffToMonday = (dayOfWeek + 6) % 7; // Difference from Monday
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Reset time to midnight

    // Calculate the end of the current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set time to end of day

    // Check if the input date is within the start and end dates
    return date >= startOfWeek && date <= endOfWeek;
}

function isDateInCurrentMonth(date) {
    // Ensure the input is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    // Get the current date
    const now = new Date();

    // Calculate the start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate the end of the current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if the input date is within the start and end dates
    return date >= startOfMonth && date <= endOfMonth;
}

//@route GET api/models/admin
//@access Private

const tool_actions = ["merge","compress","repair","pdfjpg","pdfoffice",
		"imagepdf","officepdf","htmlpdf","webpdf","pdfexcel","pdfppt","rotate","pagenumber","watermark",
		"split"]

router.get('/tools',  async (req, res) => {
	try {
	  const result = {}
	  const tools = await Tools.find()
	  result.actions = tool_actions;
	  result.tools = [];
	  for(var tool of tool_actions){
		  result.tools.push({name: tool,title: tool.toUpperCase(),active: true,action: tool+"-"+"pdf"})
	  }
	  return res.status(200).json(result)
	} catch (error) {
	  console.error(error.message)
	  res.status(500).send('Server Error')
	}
})

router.get("/tools/analysis",async(req,res)=>{
	try{
		const result = [];
		const tools = tool_actions//await Tools.find()
		const requests = await Requests.find()
		for(var tool of tools){
			tool.successfull = 0;
			tool.failed = 0;
			tool.requests = 0;
			tool.request_action = tool.action;
			for(var req of requests){
				if(req.tool.includes(/*tool.name ??*/ tool) || req.tool.includes(/*tool.action ??*/ tool) || req.action == /*tool.action ??*/ tool || req.action.includes(/*tool.action ??*/ tool) || req.tool === tool){
					if(req.success == true){
						tool.successfull+=1;
					}else{
						tool.failed += 1;
					}
					tool.requests += 1;
					tool.request_action = req.action
				}
			}
			result.push({name: tool.name ?? tool,title: tool.title ?? tool.toUpperCase(),action:tool.action ?? tool.replace("pdf",""),tool_request:tool.request_action ?? tool,status:tool.status ?? "Active",error:tool.failed,requests: tool.requests,progress: 0,success: tool.successfull})
		}
		//console.log(result);
		return res.status(200).json(result)
	}catch(error){
		console.log(error)
		res.status(500).send('Server Error')
	}
})

router.get("/customers/list",auth,async(req,res)=>{
	try{
		const result = {users:[],subscribed:[]}
		const users = await User.find().select("-password").populate('subscription')
		const subscriptions = await Subscription.find()
		for(var user of users){
			if(user.subscription){
				result.subscribed.push(user)
			}
			result.users.push(user)
		}
		res.status(200).json(result)
	}catch(error){
		console.log(error)
		res.status(500).send('Server Error')
	}
})

router.get("/analysis",auth,async (req,res)=>{
	try{
		const result = {};
		const requests = await Requests.find()
		result.requests = requests;
		const subscriptions = await Subscription.find();
		const users = await User.find().select("-password")
		result.users = users;
		result.subscriptions = subscriptions;
		const invoice = {total: 0,data:[],cancelled: 0,pending: 0,complete: 0}
		const weekly_invoice = [];
		const monthly_invoice= [];
		const weekly_total = 0;
		const monthly_total = 0;
		const invoices = await Invoice.find().populate('user');
		for(var inv of invoices){
			if(inv.complete){
				invoice.complete += inv.amount
			}else if(inv.cancelled){
				invoice.cancelled+= inv.amount
			}else{
				invoice.pending += inv.pending
			}
			invoice.total += inv.amount;
			if(isDateInCurrentWeek(inv.date)){
				weekly_invoice.push(inv);
				weekly_total += inv.amount;
			}
			if(isDateInCurrentMonth(inv.date)){
				monthly_invoice.push(inv);
				monthly_total += inv.amount;
			}
		}
		invoice.data = invoices;
		const notifications = await Notification.find({user:req.user.id})
		const uploads = await Upload.find()
		result.uploads = uploads
		result.notifications = notifications
		result.weekly_invoice = weekly_invoice;
		result.monhtly_invoice = monthly_invoice;
		result.invoice = invoice;
		res.status(200).json(result);
	}catch(error){
		console.log(error)
		res.status(500).send('Server Error')
	}
})

router.post("/tools/add",/*auth*/async (req,res)=>{
	try{
		const data = req.body;
	}catch(error){
		console.log(error)
		res.status(500).send('Server Error')
	}
})

router.post('/uploadImage',auth,  async (req, res) => {
	try {
	  //upload.single("file"),
	  const result = {};
	  result.message = "incomplete"
	  
	  return res.status(200).json(result)
		
	} catch (error) {
	  console.error(error.message)
	  res.status(500).send('Server Error')
	}
})

module.exports = router