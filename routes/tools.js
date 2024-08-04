const { PDFDocument,degrees,rgb, StandardFonts  } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const pdf_page = require("pdf-page-counter");
const fs = require('fs');
const path = require("path");
const sharp = require('sharp');
const { exec } = require('child_process');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const util = require('util');
//const exceljs = require('exceljs');
const XLSX = require('xlsx');
//const puppeteer = require('puppeteer');
const html_pdf = require('html-pdf');
const PPTXGenJS = require('pptxgenjs');
const axios = require('axios');
//const humus = require('humus');
//const { PDFExtract } = require('pdf-poppler');


// Promisify exec to use with async/await
const execPromise = util.promisify(exec);

async function extractHTMLWEB(url){
	try{
		const response = await axios.get(url);
		return response.data;
	}catch (error) {
		console.error('Error:', error.message);
		return '<html><head></head><body><h6>NO CONTENT</h6></html>'; // Rethrow the error if needed for further handling
	}
}

async function saveHTMLFILE(html,output_file){
	var outputFilePath = path.join(__dirname, '../files/uploads/'+output_file)
	try {
		// Write the HTML content to the file
		await fs.promises.writeFile(outputFilePath, html, 'utf8');
		console.log(`File saved successfully at ${outputFilePath}`);
		return output_file;
	} catch (error) {
		console.error('Error writing file:', error.message);
		return null
	}
}

async function convertPDFToWord(pdfPaths, outputPath) {
  try {
    const pdfPath = path.join(__dirname, '../files/uploads/' + pdfPaths[0].server_filename);
    let textContent = await extractTextFromPDF(pdfPaths);
    textContent = textContent.split('\n')
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: textContent.map(text => new Paragraph({
			  children: [new TextRun(text)],
			})),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    console.log('DOCX file created successfully!');
    return outputPath;
    
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}


async function mergePDF(pdfPaths, outputFilePath) {
  const mergedPdf = await PDFDocument.create();
  //pdfPaths.reverse();
  
  for (var pdfPath of pdfPaths) {
    try{
        console.log(pdfPath)
        if(!pdfPath.server_filename.includes(".pdf")){
    		pdfPath.server_filename = pdfPath.server_filename+".pdf"
    	}
    	pdfPath = path.join(__dirname,'../files/uploads/'+pdfPath.server_filename)
    	
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdf_file = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf_file, pdf_file.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
    }catch(error){
        console.log(error);
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputFilePath, mergedPdfBytes);
  return outputFilePath
}

async function compressPDF(pdfPaths, outputFilePath) {
  try {
    const pdfPath = path.join(__dirname, '../files/uploads/' + pdfPaths[0].server_filename);
    const gsCommand = `gs -q -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputFilePath} ${pdfPath}`;
    
 
    const { stdout, stderr } = await execPromise(gsCommand);
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return { success: false, error: stderr };
    }

    console.log(`PDF compressed successfully: ${stdout}`);
    return true;
  } catch (error) {
    console.error(`Error compressing PDF: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function splitPDF(pdfPaths, outputDir,pages) {
  let split_files = [];
  const newPdf = await PDFDocument.create();
  for(var pdfPath of pdfPaths){
    pdfPath = path.join(__dirname,'../files/uploads/'+pdfPath.server_filename)
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf_file = await PDFDocument.load(pdfBytes);
    if(pages == "all"){
      for (let i = 0; i < pdf_file.getPageCount(); i++) {
        
        const [copiedPage] = await newPdf.copyPages(pdf_file, [i]);
        newPdf.addPage(copiedPage);
  
       
        split_files.push(`${outputDir}/page_${i + 1}.pdf`)
      }
    }else{
      pages = pages.split(",");
      for(var page of pages){
        page = parseInt(page);
        for (let i = 0; i < pdf_file.getPageCount(); i++) {
          if(i==page-1){
            
            const [copiedPage] = await newPdf.copyPages(pdf_file, [i]);
            newPdf.addPage(copiedPage);
      
            
            split_files.push(`${i + 1}`)
          }
          
        }
      }
    }
    
  }
  const newPdfBytes = await newPdf.save();
  fs.writeFileSync(`${outputDir}_page_${split_files.join('_')}.pdf`, newPdfBytes);
  return `${outputDir}_page_${split_files.join('_')}.pdf`
}

async function removePDF(pdfPaths, outputDir,pages) {
  let split_files = [];
  const newPdf = await PDFDocument.create();
  for(var pdfPath of pdfPaths){
    pdfPath = path.join(__dirname,'../files/uploads/'+pdfPath.server_filename)
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf_file = await PDFDocument.load(pdfBytes);
    
	  pages = pages.split(",");
	  for(var page of pages){
		page = parseInt(page);
		for (let i = 0; i < pdf_file.getPageCount(); i++) {
		  if(i!=page-1){
			
			const [copiedPage] = await newPdf.copyPages(pdf_file, [i]);
			newPdf.addPage(copiedPage);
	  
			
			split_files.push(`${i + 1}`)
		  }
		  
		}
	  }
    
    
  }
  const newPdfBytes = await newPdf.save();
  fs.writeFileSync(`${outputDir}_page_${split_files.join('_')}.pdf`, newPdfBytes);
  return `${outputDir}_page_${split_files.join('_')}.pdf`
}


async function repairPDF(pdfPaths, outputFilePath) {
  try {
    const pdfPath = path.join(__dirname, '../files/uploads/' + pdfPaths[0].server_filename);
    const gsCommand = `gs -q -o ${outputFilePath} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/prepress ${pdfPath}`;

    // Await the execPromise call
    const { stdout, stderr } = await execPromise(gsCommand);
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return { success: false, error: stderr };
    }

    console.log(`PDF repaired successfully: ${stdout}`);
    return true;
  } catch (error) {
    console.error(`Error repairing PDF: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function convertPDFToImages(pdfPaths, outputFilePath, dpi, mode) {
  try {
    if (mode === "pages") {
      if (!fs.existsSync(outputFilePath)) {
        fs.mkdirSync(outputFilePath, { recursive: true });
      }

      for (const pdfPath of pdfPaths) {
        const serverFilename = pdfPath.server_filename.split(".")[0];
        const pdfPth = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
        const gsCommand = `gs -q -sDEVICE=jpeg -r${dpi} -o ${outputFilePath}/${serverFilename}_img_%03d.jpg ${pdfPth}`;

        console.log(`Converting ${pdfPth} to ${outputFilePath} with dpi ${dpi}`);

        await new Promise((resolve, reject) => {
          exec(gsCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error converting PDF to JPG: ${error.message}`);
              return reject(error);
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
              return reject(new Error(stderr));
            }
            console.log(`PDF converted to JPG successfully: ${stdout}`);
            resolve(outputFilePath);
          });
        });
      }

      return outputFilePath;
    }
	return null
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function addImageToPdf(pdfDoc, imagePath,pageSize, orientation,margin) {
  const imageBytes = fs.readFileSync(imagePath);
  const image = await pdfDoc.embedJpg(imageBytes);
  const { width: imgWidth, height: imgHeight } = image;
  if(margin == null || margin==NaN){margin=0;}
  
  const [pageWidth, pageHeight] = orientation === 'landscape'
    ? [pageSize.height, pageSize.width]
    : [pageSize.width, pageSize.height];
	
  const usableWidth = pageSize.width - 2 * margin;
  const usableHeight = pageSize.height - 2 * margin;
  
  const imgAspectRatio = imgWidth / imgHeight;
  const pageAspectRatio = usableWidth / usableHeight;
  
  let scaledWidth, scaledHeight;

  if (imgAspectRatio > pageAspectRatio) {
    
    scaledWidth = usableWidth;
    scaledHeight = scaledWidth / imgAspectRatio;
  } else {
    
    scaledHeight = usableHeight;
    scaledWidth = scaledHeight * imgAspectRatio;
  }
  
  const xOffset = margin + (usableWidth - scaledWidth) / 2;
  const yOffset = margin + (usableHeight - scaledHeight) / 2;
  
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  
  page.drawImage(image, {
    x: xOffset,
    y: yOffset,
    width: pageWidth,
    height: pageHeight,
  });
}

async function convertImagestoPDF(imagePaths, outputFilePath,pageSize,orientation,margin) {
  try{
	  const pdfDoc = await PDFDocument.create();
	  switch(pageSize.toLowerCase()){
		  case 'a4':
			pageSize = {
				width: 595,  // A4 width in points
				height: 842  // A4 height in points
			};
			break
		  case 'fit':
			pageSize = {width: 595,height: 482}
			break;
			
		  case 'a2':
			pageSize = {width: 1197.48,height: 1681.08}
			break;
		  case 'letter':
			pageSize = {width: 612,height: 792}
			break;
		  default:
			pageSize = {width: 612,height: 792}
			break;
	  }
	  for (var imagePath of imagePaths) {
		imagePath = path.join(__dirname, '../files/uploads/', imagePath.server_filename);  
		await addImageToPdf(pdfDoc, imagePath,pageSize, orientation,parseInt(margin));
	  }
	  const pdfBytes = await pdfDoc.save();
	  fs.writeFileSync(outputFilePath, pdfBytes);

	  console.log('PDF created successfully at:', outputFilePath);
	  return true;
  }catch(error){
	  console.log(error);
	  return null
  }
}

async function excelToHTML(excelPaths) {
  let html = '';
  try{
	  for(var excelPath of excelPaths){
		excelPath = path.join(__dirname, '../files/uploads/', excelPath.server_filename);
		const workbook = XLSX.readFile(excelPath);
		//const sheetName = workbook.SheetNames[0]; // Get the first sheet
		console.log("len worksheets", workbook.SheetNames.length)
		for(const shhetName of workbook.sheetNames){
			const worksheet = workbook.Sheets[sheetName];

			html += XLSX.utils.sheet_to_html(worksheet, { header: 1 });
		}
		
	  }
	  return html
  }catch(e){
	  console.log(e)
	  return null
  }
  //html += `</body></html>`;
  return html;
}

async function convertHTMLToPDF(html, outputPdfPath) {
  try{
	/*const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setContent(html);
	await page.pdf({ path: outputPdfPath, format: 'A4' });
	await browser.close();*/
	const options = { format: 'A3' };
	html = String(html);
	if(!html.includes('html')){html = '<html>'+html+'</html>';console.log(html)}
	return new Promise((resolve, reject) => {
		html_pdf.create(html, options).toFile(outputPdfPath, (err, res) => {
		  if (err) {
			reject(err);
		  } else {
			resolve(res.filename);
		  }
		});
	  });
  }catch(error){
	  console.log("error=>",error)
	  return null
  }
}

async function convertPDFToExcel(pdfPaths, excelPath) {
  try {
	const workbook = XLSX.utils.book_new();
	for(var pdfPath of pdfPaths){
		pdfPath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
		const dataBuffer = fs.readFileSync(pdfPath);
		const data = await pdf(dataBuffer);
		const fileName = path.basename(pdfPath, path.extname(pdfPath));
		const text = data.text;

		
		const rows = text.split('\n').map(line => line.split(/\s+/)); // Example: split by whitespace

	
		const ws = XLSX.utils.aoa_to_sheet(rows);

	
		XLSX.utils.book_append_sheet(workbook, ws, fileName);
    }
    
    XLSX.writeFile(workbook, excelPath);
    console.log(`Excel file created successfully at: ${excelPath}`);
	return excelPath;
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
	return null
  }
}

async function extractHTML(pdfPaths){
	try{
		let html = ``;
		for(var pdfPath of pdfPaths){
			pdfPath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
			html += fs.readFileSync(pdfPath, 'utf8');
		}
		return html
	}catch(error){
		console.log("error=>",error);
		return null
	}
}

async function extractTextFromPDF(pdfPaths) {
  try {
	let text = ''
	for(var pdfPath of pdfPaths){
		pdfPath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
		const dataBuffer = fs.readFileSync(pdfPath);
		const data = await pdf(dataBuffer);
		text += '\n'+data.text;
	}
	return text
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error.message}`);
    return null;
  }
}

async function convertPDFToPPT(textContent, outputFilePath) {
  try {
    const pptx = new PPTXGenJS();
    const slide = pptx.addSlide();

    // Add text to the slide
    slide.addText(textContent, {
      x: 1,
      y: 1,
      w: '80%',
      h: '80%',
      color: '000000',
      fontSize: 18
    });
    await pptx.writeFile(outputFilePath);
    console.log(`PowerPoint presentation created successfully at: ${outputFilePath}`);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error creating PowerPoint presentation: ${error.message}`);
    return null;
  }
}

async function rotatePDF(pdfPaths,outputDir){
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	try{
		for(var pdfPath of pdfPaths){
			let Path = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
			const pdfBytes = fs.readFileSync(Path);
			const pdfDoc = await PDFDocument.load(pdfBytes);
			let rotation = parseInt(pdfPath.rotate);
			if(rotation == NaN || rotation == null){rotation=360;}
			const pages = pdfDoc.getPages();
			pages.forEach(page => {
			
			  page.setRotation(degrees(rotation));
			});
			const rotatedPdfBytes = await pdfDoc.save();

			var outputFilePath = path.join(outputDir,pdfPath.filename);
			fs.writeFileSync(outputFilePath, rotatedPdfBytes);
		}
		return outputDir;
	}catch (error){
		console.log(error);
		return null;
	}
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.substring(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r / 255, g / 255, b / 255];
}

const getStandardFont = (fontFamily) => {
  switch (fontFamily.toLowerCase()) {
    case 'helvetica':
      return StandardFonts.Helvetica;
    case 'helvetica-bold':
      return StandardFonts.HelveticaBold;
    case 'helvetica-oblique':
      return StandardFonts.HelveticaOblique;
    case 'helvetica-bold-oblique':
      return StandardFonts.HelveticaBoldOblique;
    case 'times-roman':
      return StandardFonts.TimesRoman;
    case 'times-bold':
      return StandardFonts.TimesBold;
    case 'times-italic':
      return StandardFonts.TimesItalic;
    case 'times-bold-italic':
      return StandardFonts.TimesBoldItalic;
    case 'courier':
      return StandardFonts.Courier;
    case 'courier-bold':
      return StandardFonts.CourierBold;
    case 'courier-oblique':
      return StandardFonts.CourierOblique;
    case 'courier-bold-oblique':
      return StandardFonts.CourierBoldOblique;
    case 'symbol':
      return StandardFonts.Symbol;
    case 'zapfdingbats':
      return StandardFonts.ZapfDingbats;
    default:
      return StandardFonts.TimesRoman;
  }
};

const getCoordinates = (page, text, fontSize,helveticaFont,position,image) => {
  const { width, height } = page.getSize();
  if(helveticaFont != null){
	const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
  }else{
	  const textWidth = image[0]
  }

  switch (position) {
	case 'bottom-middle':
	  return { x: (width - textWidth) / 2, y: 10 };
	case 'top-middle':
	  return { x: (width - textWidth) / 2, y: height - fontSize - 10 };
	case 'center-middle':
	  return { x: (width - textWidth) / 2, y: (height - fontSize) / 2 };
	case 'bottom-right':
	  return { x: width - textWidth - 10, y: 10 };
	case 'bottom-left':
	  return { x: 10, y: 10 };
	case 'top-right':
	  return { x: width - textWidth - 10, y: height - fontSize - 10 };
	case 'top-left':
	  return { x: 10, y: height - fontSize - 10 };
	default:
	  return { x: 10, y: 10 };
  }
};

async function addPageNumber(pdfPaths, outputDir,controls) {
  try {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
    for(var pdfPath of pdfPaths){
		var inputFilePath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename)
		const pdfBytes = fs.readFileSync(inputFilePath);
		const pdfDoc = await PDFDocument.load(pdfBytes);

		
		const helveticaFont = await pdfDoc.embedFont(getStandardFont(controls.font_family));
		var position = `${controls.vertical_position}-${controls.horizontal_position}`
		

		
		const pages = pdfDoc.getPages();
		const pageCount = pages.length;

		let selected_pages = controls.pages;
		if(selected_pages == 'all'){
			selected_pages = null;
		}else{
			selected_pages = selected_pages.split('-');
			selected_pages = selected_pages.map(Number);
		}
		const [r, g, b] = hexToRgb(controls.background);
		var starting_no = controls.starting_number;starting_no = parseInt(starting_no);
		if(starting_no == NaN){starting_no=1;}
		var page_num = 1;
		pages.forEach((page, idx) => {
		  if(selected_pages == null || selected_pages.includes(idx+1) ){
			  page_num = idx+1;
			  
			  if(starting_no != 1){
				page_num = idx +starting_number;  
			  }else{
				  page_num = idx+1;
			  }
			  const { width, height } = page.getSize();
			  const fontSize = parseInt(controls.font_size);
			  const text = `${page_num} / ${pageCount}`;
			  const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
			  const textHeight = helveticaFont.heightAtSize(fontSize);
			  const { x, y } = getCoordinates(page, text, fontSize,helveticaFont,position);
			  page.drawText(text, {
				x, 
				y,                     
				size: fontSize,
				font: helveticaFont,
				color: rgb(r, g, b),      
			  });
		  }
		});

		const modifiedPdfBytes = await pdfDoc.save();
		var outputFilePath = path.join(outputDir,pdfPath.filename);
		fs.writeFileSync(outputFilePath, modifiedPdfBytes);
	}
    console.log(`PDF with page numbers saved to ${outputFilePath}`);
	return outputDir;
  } catch (error) {
    console.error(`Error adding page numbers to PDF: ${error.message}`);
	return null;
  }
}

async function addWaterMark(pdfPaths, outputDir,controls,mode){
	try {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	var watermarkText = controls.text;
    for(var pdfPath of pdfPaths){
		if(controls.image != undefined && pdfPath.server_filename == controls.image){
			continue;
		}
		var inputFilePath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename)
		const pdfBytes = fs.readFileSync(inputFilePath);
		const pdfDoc = await PDFDocument.load(pdfBytes);
		const fontSize = parseInt(controls.font_size);
		var position = `${controls.vertical_position}-${controls.horizontal_position}`
		if(mode == 'text'){
			const helveticaFont = await pdfDoc.embedFont(getStandardFont(controls.font_family));
			const font = await pdfDoc.embedFont(getStandardFont(controls.font_family));
			const [r, g, b] = hexToRgb(controls.font_color);
			var opacity = controls.opacity_text;
			opacity = parseInt(opacity);
			if(opacity == NaN){opacity=0;}
			if(opacity > 1){opacity=1;}
			var rotation = parseInt(controls.rotation);
			if(rotation == NaN){rotation=0;}
			const pages = pdfDoc.getPages();
			pages.forEach(page => {
			  const { width, height } = page.getSize();
			  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
			  const { x, y } = getCoordinates(page, controls.text, fontSize,helveticaFont,position);
			  
				  page.drawText(watermarkText, {
					x, 
					y,           
					size: fontSize,
					font: font,
					color: rgb(r, g, b),       
					opacity: opacity,               
					rotate: degrees(rotation)            
				  });
			  
			});
			const modifiedPdfBytes = await pdfDoc.save();
			var outputFilePath = path.join(outputDir,pdfPath.filename);
			fs.writeFileSync(outputFilePath, modifiedPdfBytes);
		}else{
			var watermarkImagePath = path.join(__dirname, '../files/uploads/', controls.image)
			const watermarkImageBytes = fs.readFileSync(watermarkImagePath);
			const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes); // Use embedJpg for JPG images

			const pages = pdfDoc.getPages();
			const scale = 1.0;
			var opacity = controls.opacity_text;
			opacity = parseInt(opacity);
			if(opacity == NaN){opacity=0;}
			if(opacity > 1){opacity=1;}
			var rotation = parseInt(controls.rotation);
			if(rotation == NaN){rotation=0;}
			pages.forEach(page => {
			  const { width, height } = page.getSize();
			  const { width: imgWidth, height: imgHeight } = watermarkImage.size();

			  
			  const scaledWidth = imgWidth * scale;
			  const scaledHeight = imgHeight * scale;
			  const { x, y } = getCoordinates(page, null, fontSize,null,position,[scaledWidth,scaledHeight]);

			  page.drawImage(watermarkImage, {
				x,
				y,
				width: scaledWidth,
				height: scaledHeight,
				opacity,
				rotate: degrees(rotation)
			  });
			});

			// Serialize the PDF to bytes
			const modifiedPdfBytes = await pdfDoc.save();
			var outputFilePath = path.join(outputDir,pdfPath.filename);
			fs.writeFileSync(outputFilePath, modifiedPdfBytes);
		}
		
	}
    console.log(`PDF with watermark saved to ${outputFilePath}`);
	return outputDir;
  } catch (error) {
    console.error(`Error adding watermark to PDF: ${error.message}`);
	return null;
  }
}

async function addMetadataToPDF(pdfPaths, outputDir) {
  try {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
    for(var pdfPath of pdfPaths){
		var inputFilePath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename)
		const pdfBytes = fs.readFileSync(inputFilePath);
		const pdfDoc = await PDFDocument.load(pdfBytes);

		
		pdfDoc.setTitle('Sample PDF');
		pdfDoc.setAuthor('Author Name');
		pdfDoc.setSubject('Sample Subject');
		pdfDoc.setKeywords('keyword1, keyword2');
		pdfDoc.setProducer('PDF Producer');
		pdfDoc.setCreator('PDF Creator');

		
		const modifiedPdfBytes = await pdfDoc.save();

		var outputFilePath = path.join(outputDir,pdfPath.filename);
		fs.writeFileSync(outputFilePath, modifiedPdfBytes);
	}
    console.log(`PDF with metadata saved to ${outputDir}`);
	return outputDir;
  } catch (error) {
    console.error(`Error adding metadata to PDF: ${error.message}`);
	return null;
  }
}

async function encryptPDF(inputFileName, outputDir, config) {
  try {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	const inputFilePath = path.join(__dirname, '../files/uploads/', inputFileName);
    const outputFilePath = path.join(outputDir, inputFileName);
	const userPassword = config.userPassword.replace(/(["'$`\\])/g,'\\$1');
    const ownerPassword = config.ownerPassword.replace(/(["'$`\\])/g,'\\$1');
	const gsCommand = `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=${outputFilePath} \
   -dEncryptionR=3 -dKeyLength=128 -dOwnerPassword=${ownerPassword} \
   -dUserPassword=${userPassword} -dAllowPrinting ${inputFilePath}`;

	
	await new Promise((resolve, reject) => {
	  exec(gsCommand, (error, stdout, stderr) => {
		if (error) {
		  console.error(`Error encrypting: ${error.message}`);
		  return reject(null);
		}
		if (stderr) {
		  console.error(`stderr: ${stderr}`);
		  return reject(null);
		}
		console.log(`PDF encrypted: ${stdout}`);
		resolve(outputFilePath);
	  });
	});
	
   
    return outputFilePath
  } catch (error) {
    console.error(`Error adding password to PDF: ${error}`);
	return null;
  }
}
async function decryptPDF(pdfPaths, outputDir) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const decryptSinglePDF = (pdfPath) => {
      return new Promise((resolve, reject) => {
        const inputFilePath = path.join(__dirname, '../files/uploads/', pdfPath.server_filename);
        const psFilePath = path.join(outputDir, pdfPath.filename.replace(".pdf", ".ps"));
        const pdfOutputFilePath = path.join(outputDir, pdfPath.filename.replace(".pdf", ".decrypted.pdf"));
        const pdf2psCommand = `pdf2ps ${inputFilePath} ${psFilePath}`;
        const ps2pdfCommand = `ps2pdf ${psFilePath} ${pdfOutputFilePath}`;

        // Convert PDF to PS
        exec(pdf2psCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error converting PDF to PS: ${error.message}`);
            return reject(error);
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            return reject(new Error(stderr));
          }
          console.log(`PDF to PS conversion successful: ${stdout}`);

          // Convert PS back to PDF
          exec(ps2pdfCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error converting PS to PDF: ${error.message}`);
              return reject(error);
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
              return reject(new Error(stderr));
            }
            console.log(`PS to PDF conversion successful: ${stdout}`);
            resolve(pdfOutputFilePath);
          });
        });
      });
    };

    // Process all PDFs in parallel
    const decryptedFiles = await Promise.all(pdfPaths.map(decryptSinglePDF));
    console.log(`Password removed and saved to: ${decryptedFiles}`);
    return decryptedFiles;
  } catch (error) {
    console.error(`Error removing password from PDF: ${error.message}`);
  }
}

async function getPDFdetail(pdfPath){
    try{
    	var inputFilePath = path.join(__dirname, '../files/uploads/', pdfPath)
    	const pdfBytes = fs.readFileSync(inputFilePath);
    	const pdfDoc = await PDFDocument.load(pdfBytes,{ ignoreEncryption: true });
    
    	const pageDimensions = [];
    	const numPages = pdfDoc.getPageCount();
    	for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
    		const { width, height } = page.getSize();
    		console.log(`Page ${i + 1}: width=${width}, height=${height}`);
    		pageDimensions.push(width+"x"+height );
    	}
    	return {pages: numPages,dimensions:pageDimensions}
    }catch(error){
        console.log(error);
        return {pages: 0,dimensions:[]};
    }
}

async function previewPDF(pdfPath, page_no, dimension) {
  try {
    var file_name = path.join(__dirname, '../files/uploads/', pdfPath);
    const pdfBytes = fs.readFileSync(file_name);
    const pdfDoc = await PDFDocument.load(pdfBytes,{ ignoreEncryption: true });
    dimension = parseInt(dimension);

    const numPages = pdfDoc.getPageCount();
    if (page_no < 1 || page_no > numPages) {
      console.log(`Page number out of range. The document has ${numPages} pages.`);
      return null;
    }
    const page = pdfDoc.getPage(page_no - 1);
    const { width, height } = page.getSize();

    //const newDimension = dimension;
    //const scaleX = newDimension / width;
    ////const scaleY = newDimension / height;
    //page.scaleContent(scaleX, scaleY);

    const newPdfDoc = await PDFDocument.create();
    const [resizedPage] = await newPdfDoc.copyPages(pdfDoc, [page_no - 1]);
    newPdfDoc.addPage(resizedPage);
    const newPdfBytes = await newPdfDoc.save();
    const newPdfPath = path.join(__dirname, '../files/uploads/', Date.now() + '_temp.pdf');
    fs.writeFileSync(newPdfPath, newPdfBytes);
    const dpi = dimension;
    var outputFilePath = path.join(__dirname, '../files/uploads/', "" + Date.now());

    if (!fs.existsSync(outputFilePath)) {
      fs.mkdirSync(outputFilePath, { recursive: true });
    }

    const gsCommand = `gs -q -sDEVICE=jpeg -r${dpi+150} -o ${outputFilePath}/page-%03d.jpg ${newPdfPath}`;

    var newFilePath = null;
    await new Promise((resolve, reject) => {
      exec(gsCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error converting PDF to JPG: ${error.message}`);
          return reject(null);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return reject(null);
        }
        newFilePath = path.join(outputFilePath,"page-001.jpg");
        resolve(newFilePath);
      });
    });

    return newFilePath;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
    convertPDFToImages,
    splitPDF,
	removePDF,
	compressPDF,
	convertPDFToWord,
	convertImagestoPDF,
	excelToHTML,
	extractHTML,
	convertHTMLToPDF,
	convertPDFToExcel,
	convertPDFToPPT,
	extractTextFromPDF,
	rotatePDF,
	repairPDF,
	addPageNumber,
	addWaterMark,
	extractHTMLWEB,
	getPDFdetail,
	saveHTMLFILE,
	addMetadataToPDF,
	encryptPDF,
	decryptPDF,
	previewPDF,
	mergePDF
};
