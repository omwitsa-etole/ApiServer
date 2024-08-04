const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('../config/default.json')
const auth = require('../middlewares/auth')
const admin= require('../middlewares/admin')
const path = require('path');
const Uploads = require("../models/Uploads")
const Process = require("../models/Process")
const Notification = require('../models/Notification')
const Tool = require("../routes/tools")
const ProTool = require("../routes/pro_tools") 
const archiver = require('archiver');
const fs = require('fs');
const Requests = require("../models/RequestsTool")

const multer = require("multer");
const getUploadPath = (surname) => {
  // Base directory for uploads
  const baseDir = '../files/uploads';
  
  // Construct the directory path based on the surname
  const uploadDir = path.join(__dirname,baseDir);

  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default to 'unknown' if no surname is provided
    const surname ="";
    const uploadPath = getUploadPath(surname);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
  }
});


const upload = multer({ storage: storage });

function generateRandomInt(){
  min = Math.ceil(100000001);
  max = Math.floor(999999999);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseData(data){
	const keys = Object.keys(data);
	let formData = {};
	curr = null;
	for(var key in keys){
		let value = data[key];
		  
		if(key.includes('signers')){
			  let index = name.replace("signers[","")
			  index = index.replace("]","")
			  index = index.replace("[","")
			  let matches = index.match(/^(\d+|\w+)(.*)$/);
			  
			  let child_curr = matches[2].replace("]","");
			  index = index.replace(child_curr,"")
			  index = index.replace("signers","")
			  index = index.replace("]","")
			  child_curr = child_curr.replace("[","")
			  console.log(index,child_curr);
			  index = parseInt(index);
			  //console.log(formData.signers)
			  if(formData.signers === undefined){
				  formData.signers = [];
				  
			  }
			  //console.log(formData);
			  if (formData.signers.length < index+1) {
				formData['signers'][index] = {};
			  }
			  if (!formData.signers[index][child_curr]) {
				formData['signers'][index][child_curr]="";	
				curr = [index,child_curr];
			  }
		}else{
			if(curr && value != ''){
			  
			  if (Array.isArray(curr)) {
				//console.log(curr,"val",value)
				formData.signers[curr[0]][curr[1]] = value;
			  }else{
				  formData[curr] = value;
			  }
				
				curr = null;
			}  
		}
	}
	for(var key in keys){
		let value = data[key];
		if(key.includes('sign_data')){
			  let index = name.replace("sign_data[","")
			  index = index.replace("]","")
			  index = index.replace("[","")
			  let matches = index.match(/^(\d+|\w+)(.*)$/);
			  
			  let child_curr = matches[2].replace("]","");
			  index = index.replace(child_curr,"")
			  index = index.replace("sign_data","")
			  index = index.replace("]","")
			  child_curr = child_curr.replace("[","")
			  console.log(index,child_curr);
			  index = parseInt(index);
			  //console.log(formData.sign_datas)
			  if(formData.sign_data === undefined){
				  formData.sign_data = [];
				  
			  }
			  //console.log(formData);
			  if (formData.sign_data.length < index+1) {
				formData['sign_data'][index] = {};
			  }
			  if (!formData.sign_data[index][child_curr]) {
				formData['sign_data'][index][child_curr]="";	
				curr = [index,child_curr];
			  }
		}else{
			if(curr && value != ''){
			  
			  if (Array.isArray(curr)) {
				//console.log(curr,"val",value)
				formData.sign_data[curr[0]][curr[1]] = value;
			  }else{
				  formData[curr] = value;
			  }
				
				curr = null;
			}  
		}
	}
	for(var key of keys){
		let value = data[key];
		if(key.includes('elements')){
			  let index = name.replace("elements[","")
			  index = index.replace("]","")
			  index = index.replace("[","")
			  let matches = index.match(/^(\d+|\w+)(.*)$/);
			  
			  let child_curr = matches[2].replace("]","");
			  index = index.replace(child_curr,"")
			  index = index.replace("elements","")
			  index = index.replace("]","")
			  child_curr = child_curr.replace("[","")
			  console.log(index,child_curr);
			  index = parseInt(index);
			  //console.log(formData.elements)
			  if(formData.elements === undefined){
				  formData.elements = [];
				  
			  }
			  //console.log(formData);
			  if (formData.elements.length < index+1) {
				formData['elements'][index] = {};
			  }
			  if (!formData.elements[index][child_curr]) {
				formData['elements'][index][child_curr]="";	
				curr = [index,child_curr];
			  }
		}else{
			if(curr && value != ''){
			  
			  if (Array.isArray(curr)) {
				//console.log(curr,"val",value)
				formData.elements[curr[0]][curr[1]] = value;
			  }else{
				  formData[curr] = value;
			  }
				
				curr = null;
			}  
		}
	}
	return formData;
}

async function processTool(tool,data){
	switch(tool){
		case 'editpdf':
		    var files= data.files;
			var new_req = new Requests({tool: 'edit',action: 'edit_pdf'})
			//var data = parseData(data)
			console.log("edit=>",data)
			var result = await ProTool.signPDF(files,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"success": true, output: data.output_filename,tool: "edited"}
			}
			await new_req.save()
			break
	    case 'sign':
	        var files= data.files;
			var new_req = new Requests({tool: 'sign',action: 'sign_pdf'})
			//var data = parseData(data)
			console.log("sign=>",data.files,files)
			var result = await ProTool.signPDF(files,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"success": true, output: data.output_filename,tool: "signed"}
			}
			await new_req.save()
			break
		case 'merge':
			var new_req = new Requests({tool: 'merge',action: 'merge_pdf'})
			
			var result = await Tool.mergePDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename));
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"success": true, output: data.output_filename,tool: "merged"}
			}
			await new_req.save()
			break
		case 'compress':
			var new_req = new Requests({tool: 'compress',action: 'compress_pdf'})
			var result = await Tool.compressPDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result == true){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "compressed"}
			}
			await new_req.save()
			return result
			break
		case 'repair':
			var new_req = new Requests({tool: 'repair',action: 'repair_pdf'})
			var result = await Tool.repairPDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result == true){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "repaired"}
			}
			await new_req.save()
			return result
		case 'pdfjpg':
			var new_req = new Requests({tool: 'pdfjpg',action: 'pdf_to_jpg'})
			var result = await Tool.convertPDFToImages(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),data.dpi,data.pdfjpg_mode)
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "images"}
			}
			await new_req.save()
			return null
		case 'pdfoffice':
			var new_req = new Requests({tool: 'pdfoffice',action: 'pdf_to_office'})
			if(data.convert_to == 'xlsx'){
				new_req.action = 'pdf_to_xlsx'
				var result = await Tool.convertPDFToExcel(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf",".xls")));
				if(result){
					new_req.success = true;
					await new_req.save()
					var out = result.split('uploads')[1].replace(/[\\]/g,"");
					return {"success": true, output: out,tool: "pdfexcel"} 
				}  
				await new_req.save()
				return null
			}else if(data.convert_to == 'pptx'){
				new_req.action = 'pdf_to_pptx'
				var textContent = await Tool.extractTextFromPDF(data.files)
				var result = await Tool.convertPDFToPPT(textContent,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf",".pptx")))
				if(result != null){
					new_req.success = true;
					await new_req.save()
					return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "pptx"}
				}
				await new_req.save()
				return null
			}else{
				new_req.action = 'pdf_to_word'
				var result = await Tool.convertPDFToWord(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf",""))+".docx")
				if(result != null){
					new_req.success = true;
					await new_req.save()
					return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "docx"}
				}
				await new_req.save()
				return null
			}
			
		case 'imagepdf':
			var new_req = new Requests({tool: 'imagepdf',action: 'image_to_pdf'})
			var result = await Tool.convertImagestoPDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename),data.pagesize,data.orientation,data.margin)
			if(result == true){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "jpgpdf"}
			}
			await new_req.save()
			return null
		case 'officepdf':
			var new_req = new Requests({tool: 'officepdf',action: 'excel_to_pdf'})
			var html = await Tool.excelToHTML(data.files)
			var result = await Tool.convertHTMLToPDF(html,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "excelpdf"}
			}
			await new_req.save()
			return null
		case 'htmlpdf':
			var new_req = new Requests({tool: 'htmlpdf',action: 'html_to_pdf'})
			var html = await Tool.extractHTML(data.files)
			var result = await Tool.convertHTMLToPDF(html,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "htmlpdf"}
			}
			await new_req.save()
			return null
		case 'webpdf':
			var new_req = new Requests({tool: 'webpdf',action: 'web_to_pdf'})
			var html = await Tool.extractHTMLWEB(data.cloud_file)
			var result = await Tool.convertHTMLToPDF(html,path.join(__dirname,'../files/uploads/'+data.output_filename))
			if(result){
				new_req.success= true;
				await new_req.save()
				return {"sucess":true,output:data.output_filename,tool: "htmlpdf"}
			}
			await new_req.save()
			return null
		case 'pdfexcel':
			var new_req = new Requests({tool: 'pdfexcel',action: 'pdf_to_excel'})
			var result = await Tool.convertPDFToExcel(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf",".xls")));
			if(result){
				new_req.success = true;
				await new_req.save()
				var out = result.split('uploads')[1].replace(/[\\]/g,"");
				return {"success": true, output: out,tool: "pdfexcel"} 
			 }  
			 await new_req.save()
			return null
		case 'pdfppt':
			var new_req = new Requests({tool: 'pdfppt',action: 'pdf_to_ppt'})
			var textContent = await Tool.extractTextFromPDF(data.files)
			var result = await Tool.convertPDFToPPT(textContent,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf",".pptx")))
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "pptx"}
			}
			await new_req.save()
			return null
		case 'rotate':
			var new_req = new Requests({tool: 'rotate',action: 'rotate_pdf'})
			var result = await Tool.rotatePDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")))
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "rotated"}
			}
			await new_req.save()
			return null
		case 'pagenumber':
			var new_req = new Requests({tool: 'pagenumber',action: 'paginate_pdf'})
			var result = await Tool.addPageNumber(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),{
					pages: data.pages,facing_pages: data.facing_pages,first_cover:data.first_cover,starting_number:data.starting_number,
					vertical_position:data.vertical_position,horizontal_position:data.horizontal_position,
					vertical_adjustment: data.vertical_position_adjustment,horizontal_adjustment:data.horizontal_position_adjustment,
					font_family:data.font_family,font_style:data.font_style,font_size:data.font_size,
					font_color:data.font_color,text:data.text,isDefault:data.isDefault,page_first:data.page_init,
					page_end:data.page_end,font_size_number:data.font_size_number,background:data.background,
					font_color_shadow:data.font_color_shadow,opacity_text:data.opacity_text
				})
			if(result != null){
				new_req.success=true;
				await new_req.save()
				return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "paginated"}
			}
			await new_req.save()
			return null;
		case 'watermark':
			var new_req = new Requests({tool: 'watermark',action: 'watermark_pdf'})
			var result = await Tool.addWaterMark(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),{
				pages: data.pages,starting_number:data.starting_number,
				vertical_position:data.vertical_position,horizontal_position:data.horizontal_position,
				vertical_adjustment: data.vertical_position_adjustment,horizontal_adjustment:data.horizontal_position_adjustment,
				font_family:data.font_family,font_style:data.font_style,font_size:data.font_size,
				font_color:data.font_color,text:data.text,isDefault:data.isDefault,page_first:data.page_init,
				font_size_number:data.font_size_number,background:data.background,
				font_color_shadow:data.font_color_shadow,opacity_text:data.opacity_text,image_resize:data.image_resize,
				layer:data.layer,rotation:data.rotation,image:data.image
			},data.mode)
			if(result != null){
				new_req.success = true;
				await new_req.save()
				return {"sucess":true,output:result.split('uploads')[1].replace(/[\\]/g,""),tool: "watermarked"}
			}
			await new_req.save()
			return null;
		case 'protect':
			if(data.password != data.password2){
				return {"success":false,"message": "password do not match"}
			}
			var new_req = new Requests({tool: 'encrypt',action: 'encrypt_pdf'})
			var combined = data.files
			if(data.files.length > 1){
				combined = await Tool.mergePDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename));
			}else{
				combined = data.files[0].server_filename;
			}
			var result= await Tool.encryptPDF(combined,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),{
				userPassword: data.password2,ownerPassword:data.password,password: data.password
			})
			if(result != null){
				new_req.success = true;
				await new_req.save()
				var out = result.split('uploads')[1].replace(/[\\]/g,"");
				return {"success": true, output: out,tool: "encrypted"} 
			}
			await new_req.save()
			return null
		case 'unlock':
			var new_req = new Requests({tool: 'decrypt',action: 'decrypt_pdf'})
			var result= await Tool.decryptPDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")))
			if(result != null){
				new_req.success = true;
				await new_req.save()
				var out = result.split('uploads')[1].replace(/[\\]/g,"");
				return {"success": true, output: out,tool: "decrypted"} 
			}
			await new_req.save()
			return null
    case 'split':
		var new_req = new Requests({tool: 'split',action: 'split_pdf'})
	  var mode = data.split_mode
	  if(mode == "remove_pages"){
		  new_req.action = 'remove_pdf_pages'
		var result = await Tool.removePDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),data.remove_pages);
		  if(result){
			  new_req.success = true;
			  await new_req.save()
			var out = result.split('uploads')[1].replace(/[\\]/g,"");
			return {"success": true, output: out,tool: "removed"} 
		  }  
	  }else{
		  
		  var result = await Tool.splitPDF(data.files,path.join(__dirname,'../files/uploads/'+data.output_filename.replace(".pdf","")),data.extract_pages);
		  if(result){
				new_req.success = true;
				await new_req.save()
			var out = result.split('uploads')[1].replace(/[\\]/g,"");
					return {"success": true, output: out,tool: "split"}
				}
	  }
	  await new_req.save()
	  return null
      break
		default:
			return {}
			break;
	}
}

function findBoundary(formDataString) {
  const regex = /--([^-]*)/g;
  const matches = formDataString.match(regex);

  
  if (!matches || matches.length < 2) {
    throw new Error("Invalid form data format. Missing boundaries.");
  }

  // The first and last matches are the actual boundaries (excluding "--")
  return matches[0].slice(2) // First boundary
        + matches[matches.length - 1].slice(2); // Last boundary
}

function parseFormData(multipartData) {
  let formData = {};
  let boundary = findBoundary(multipartData);
  //console.log(boundary);
  let parts = multipartData.split(boundary);
  //console.log(parts)
  let curr = null;
  for (let i = 1; i < parts.length - 1; i++) {
    let part = parts[i].trim();
    try{
      let matchName = part.match(/name="([^"]+)"/);
      if (matchName) {
          let name = matchName[1];
        
          let value = "";
          if(!name.includes("level") && !name.includes("files")){
			  formData[name] = value;
			  if(curr==null){
				curr = name;
			  }
          }
		  if(name.includes("files")){
			  let index = name.replace("files[","")
			  index = index.replace("]","")
			  index = index.replace("[","")
			  let matches = index.match(/^(\d+|\w+)(.*)$/);
			  
			  let child_curr = matches[2].replace("]","");
			  index = index.replace(child_curr,"")
			  index = index.replace("files","")
			  index = index.replace("]","")
			  child_curr = child_curr.replace("[","")
			  console.log(index,child_curr);
			  index = parseInt(index);
			  //console.log(formData.files)
			  if(formData.files === undefined){
				  formData.files = [];
				  
			  }
			  //console.log(formData);
			  if (formData.files.length < index+1) {
				formData['files'][index] = {};
			  }
			  if (!formData.files[index][child_curr]) {
				formData['files'][index][child_curr]="";	
			    curr = [index,child_curr];
			  }
			  
			  
			  //console.log(index,child_curr);
			  
		  }
      }else{
        //console.log(part.includes('name='),part.includes("--"))
        if(part.includes('name=') ==false&& part.includes("--")==false){
          value = part.replace(/\n/g, '');
		  //console.log(curr,"=",value)
          if(curr && value != ''){
			  
			  if (Array.isArray(curr)) {
				//console.log(curr,"val",value)
				formData.files[curr[0]][curr[1]] = value;
			  }else{
				  formData[curr] = value;
			  }
            
            curr = null;
          }  
        }
      }
    }catch(e){console.log(e)}
}
  
  return formData;
}

router.get("/task/:task/:id",async( req,res)=>{
	try{
		const data = req.body;
	 
	  console.log("task=>id",data);
	  res.status(200).json({success:true,result: "success"});
	}catch(error){
		console.log(error);
		res.status(500).send('Server Error')
	}
})

router.post("/task/:task",async( req,res)=>{
	try{
	    const data = req.body;
	    console.log("task=>",data);
		res.status(200).json({success:true,result: "success"});
	}catch(error){
		console.log(error);
		res.status(500).send('Server Error')
	}
})



router.post("/process",async(req,res)=>{
  let body = '';
  let responseSent = false;
  try{
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      body = body.replace(/\n/g, '');
      body = body.replace('Content-Disposition: form-data;','');
      let data = parseFormData(body);
      
	  data.output_filename =Date.now()+"_"+data.tool
	  if(!data.output_filename.includes(".pdf")){
		  data.output_filename = data.output_filename+".pdf"
	  }
	  if(data.cloud_file && data.cloud_file.includes('http')){data.tool = 'webpdf'}
	 
    data.custom_int = generateRandomInt();
    console.log(data);
	  if(data.tool){
	      let result = await processTool(data.tool,data)
	       
		 if(data.tool.includes('edit') || data.tool.includes('sign')){
		     
			var processed = new Process({name: data.tool,file:result.output,key:data.task,Id:data.custom_int})
			await processed.save()
			if (!responseSent) {
              responseSent = true;
    			res.status(200).json({download_filename: "",filesize: 1,output_extensions: 'pdf',
    			output_filenumber: 1,output_filesize: 2,status: "TaskSuccess",timer: "0.27",
    			key: data.task,Id:data.custom_int,tool:result.tool
    			})
			}
		}
		
		if(result && result.output){
			const processed = new Process({name: data.tool,file:result.output,key:data.task,Id:data.custom_int})
			await processed.save()
			result.key = data.task;
			result.Id = data.custom_int;	
      //result.tool = data.tool;
			console.log(result,processed);
			if (!responseSent) {
              responseSent = true;
			   res.status(200).json(result);
			}
		}else{
			if (!responseSent) {
              responseSent = true;
				res.status(400).json({message: "AN error occured could not complete "+data.tool})
			}
		}
		  
	  }else{
		if (!responseSent) {
              responseSent = true;
			res.status(400).json({"message": "invalid no tool specified"});
		}
	  }
    });
    
    
  }catch(error){
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

router.get("/download/:id",async(req,res)=>{
  try{
    const process = await Process.findOne({Id:req.params.id});
    if(process.file){
	  if(process.file.includes(".")){
		res.sendFile(path.join(__dirname,'../files/uploads/'+process.file));
	  }else{
		  console.log(process.file)
		  const sourceFolder = path.join(__dirname,'../files/uploads/'+process.file);
			
			zipFolder(sourceFolder,process.file)
			  .then((outputZipPath) => {
				console.log('Folder successfully zipped!');
				console.log('Output zip path:', outputZipPath);
				res.sendFile(outputZipPath, (err) => {
					if (err) {
					  console.error('Error sending file:', err);
					  res.status(404).json({ "message": "Error loading files, try again by refreshing" });
					} else {
					  // Delete the zip file after sending the response
					  fs.unlink(outputZipPath, (unlinkErr) => {
						if (unlinkErr) {
						  console.error('Error deleting zip file:', unlinkErr);
						} else {
						  console.log('Zip file deleted successfully');
						}
					  });
					}
				});
			  })
			  .catch((error) => {
				console.error('Error zipping folder:', error);
				res.status(404).json({"message":"Error loading files, try again by refreshing"});
			  });
	  }
    }else{
      res.status(404).json({"message":"Unkown file not found"});
    }
    
;  }catch(error){
    console.error(error.message)
    res.status(500).send('Server Error')
  }
})

router.post("/preview",async(req,res)=>{
	let body = '';
	try{
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', async () => {
		  body = body.replace(/\n/g, '');
		  body = body.replace('Content-Disposition: form-data;','');
		  let data = parseFormData(body);
		  console.log(data);
		  res.sendFile(path.join(__dirname,'../files/uploads/'+data.server_filename));
		})
		
	}catch(error){
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

router.get("/pdfrender/:id/:timestamp/:page/:dimension",async (req,res)=>{
	try{
		const file_name = req.params.timestamp+".pdf"
		var page_no = parseInt(req.params.page)
		if(page_no == NaN){page_no=1}
		const dimension = req.params.dimension
		var result = await Tool.previewPDF(file_name,page_no,dimension)
		if(result != null){
			res.sendFile(result,(err)=>{
				if(err){
					console.error('Error sending file:', err);
					res.status(404).json({ "message": "Error loading files, try again by refreshing" });
				}
				fs.unlink(result, (unlinkErr) => {
					if (unlinkErr) {
					  console.error('Error deleting img file:', unlinkErr);
					} else {
					  console.log('img file deleted successfully');
					}
				  });
			})
		}else{
			res.status(400).send('Not found or error')
		}
	}catch(error){
		console.log(error);
		res.status(500).send('Server Error')
	}
})


router.post('/upload', upload.single('file'), async (req, res) => {
  const body = req.body;
  console.log(body)
  let responseSent = false;
  if (req.file) {
    const new_upload = new Uploads({name:req.file.filename,task:body.task});
    if(req.body.userId){
      new_upload.user = req.body.userId;
    }
    await new_upload.save()
	if(req.file.filename.includes(".png")){
		if (!responseSent) {
			responseSent = true;
			res.status(200).json({
			  server_filename: req.file.filename,
			  file: body.name,
			  
			});
		}
	}
	var pdf_detail = await Tool.getPDFdetail(req.file.filename)
	if (!responseSent) {
		responseSent = true;
		res.status(200).json({
		  server_filename: req.file.filename,
		  file: body.name,
		  pdf_page_number: pdf_detail.pages,
		  pdf_pages: pdf_detail.dimensions,
		});
	}
  }else if(body.cloud_file){
	var html = await Tool.extractHTMLWEB(body.cloud_file)
	var result = await Tool.saveHTMLFILE(html,Date.now()+".txt")
	if(result != null){
		if (!responseSent) {
			responseSent = true;
			res.status(200).json({
			  server_filename: result,
			  file: result.replace(".txt",".html"),
			});  
		}
	}else{
		res.status(400).json({ error: 'No file uploaded' });
	}
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

router.post('/upload/upload-single', upload.single('file'), async (req, res) => {
  const body = req.body;
  console.log(body)
  let responseSent = false;
  if (req.file) {
    const new_upload = new Uploads({name:req.file.filename,task:body.task});
    if(req.body.userId){
      new_upload.user = req.body.userId;
    }
    await new_upload.save()
	if(req.file.filename.includes(".png")){
		if (!responseSent) {
			responseSent = true;
			res.status(200).json({
			  server_filename: req.file.filename,
			  file: body.name,
			  
			});
		}
	}
	var pdf_detail = await Tool.getPDFdetail(req.file.filename)
	if (!responseSent) {
		responseSent = true;
		res.status(200).json({
		  server_filename: req.file.filename,
		  file: body.name,
		  pdf_page_number: pdf_detail.pages,
		  pdf_pages: pdf_detail.dimensions,
		});
	}
  }else if(body.cloud_file){
	var html = await Tool.extractHTMLWEB(body.cloud_file)
	var result = await Tool.saveHTMLFILE(html,Date.now()+".txt")
	if(result != null){
		if (!responseSent) {
			responseSent = true;
			res.status(200).json({
			  server_filename: result,
			  file: result.replace(".txt",".html"),
			});  
		}
	}else{
		res.status(400).json({ error: 'No file uploaded' });
	}
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

router.delete("/upload/<key>/<file_name>",async (req,res)=>{
	try{
		console.log(req.body);
		const file_name = req.params.filename;
		console.log(filename);
		
		res.status(200)
	}catch(error){
		console.log(error)
		res.status(500).send('Server Error')
	}
})

router.post('/upload/upload-multiple', upload.array('files', 10), async (req, res) => { 
  if (req.files && req.files.length > 0) {
    const filenames = req.files.map(file => file.filename);
    for(var file of filenames){
      const new_upload = new Uploads({name:req.file.filename});
      if(req.body.userId){
        new_upload.user = req.body.userId;
      }
      await new_upload.save()
    }
    res.json({
      server_filenames: filenames
    });
  } else {
    res.status(400).json({ error: 'No files uploaded' });
  }
});

router.delete('/v1/upload/:key/:filename', async (req, res) => {
    try{
		var filePtah = path.join(__dirname,'../files/uploads/',req.params.filename)
		fs.unlink(filePath, (unlinkErr) => {
			if (unlinkErr) {
			  console.error('Error deleting  file:', unlinkErr);
			  res.status(400).json({success:false});
			} else {
			  console.log('file deleted successfully');
			  res.status(200).json({success:true});
			}
		 });
	}catch(error){
		console.log("deleting error=>",error)
		res.status(500).send('Server Error')
	}
});

async function zipFolder(sourceFolder,folder) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(__dirname,'../files/uploads/'+folder+`/output_${timestamp}.zip`);
  //const outPath = path.join(__dirname, `output_${timestamp}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  const output = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Zipped ${archive.pointer()} total bytes.`);
      resolve(outPath);
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    fs.readdir(sourceFolder, (err, files) => {
      if (err) {
        return reject(err);
      }

      files.forEach((file) => {
        const filePath = path.join(sourceFolder, file);
        if (fs.statSync(filePath).isFile()) {
          archive.file(filePath, { name: file });
        }
      });

      archive.finalize();
    });
  });
}


module.exports = router