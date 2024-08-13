const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/admin')
const multer = require("multer");
const Tools = require("../models/Tools")

const upload = multer({ dest: 'files/uploads/' });
//const {formidable} = require('formidable');

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
	  result.tools = tools;
	  return res.status(200).json(result)
	} catch (error) {
	  console.error(error.message)
	  res.status(500).send('Server Error')
	}
})

router.get("/tools/analysis",async(req,res)=>{
	try{
		const result = [];
		const tools = await Tools.find()
		const requests = await Requests.find()
		for(var tool of tools){
			tool.successfull = 0;
			tool.failed = 0;
			tool.requests = 0;
			tool.request_action = tool.action;
			for(var req of requests){
				if(req.tool.includes(tool.name) || req.tool.includes(tool.action) || req.action == tool.action || req.action.includes(tool.action)){
					if(req.success == true){
						tool.successfull+=1;
					}else{
						tool.failed += 1;
					}
					tool.requests += 1;
					tool.request_action = req.action
				}
			}
			result.push({name: tool.name,title: tool.title,action:tool.action,tool_request:tool.request_action,status:tool.status,error:tool.failed,requests: tool.requests,progress: 0,success: tool.successfull})
		}
		return res.status(200).json(result)
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