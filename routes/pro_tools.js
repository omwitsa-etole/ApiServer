const { PDFDocument,degrees,rgb, StandardFonts  } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const pdf_page = require("pdf-page-counter");
const fs = require('fs');
const path = require("path");
const sharp = require('sharp');
const { exec } = require('child_process');
const pdf = require('pdf-parse');

async function signPDF(pdfPaths,outputFilePath){
  const mergedPdf = await PDFDocument.create();
  //pdfPaths.reverse();
  for (var pdfPath of pdfPaths) {
    try{
        //console.log(pdfPath)
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

module.exports = {
	signPDF,
}