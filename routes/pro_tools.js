const { PDFDocument,degrees,rgb, StandardFonts  } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const pdf_page = require("pdf-page-counter");
const fs = require('fs');
const path = require("path");

const { exec } = require('child_process');
const pdf = require('pdf-parse');


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

const getCoordinates = (page, text, fontSize,helveticaFont,position,image,textWidth=1) => {
  const { width, height } = page.getSize();
  

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
	  //return { x: 10, y: 10 };
	  return { x: width - textWidth , y: height - fontSize - 10 };
  }
};

async function signPDF(pdfPaths,outputFilePath,controls){
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
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
		const fontSize = parseInt(controls.font_size ?? 12);
		var position = `${controls.vertical_position}-${controls.horizontal_position}`
        const watermarkText = controls['sign_data[name]'];
		const helveticaFont = await pdfDoc.embedFont(getStandardFont(controls['sign_data[font]']));
		const font = await pdfDoc.embedFont(getStandardFont(controls['sign_data[font]']));
		const [r, g, b] = hexToRgb(controls['sign_data[color]']);
		var opacity = 1;
		opacity = parseInt(opacity);
		if (isNaN(opacity)) { opacity = 0; }
		if (opacity > 1) { opacity = 1; }
		var rotation = 0;
		if (isNaN(rotation)) { rotation = 0; }
		const pages = pdfDoc.getPages();
		console.log("font-size="+fontSize)
		pages.forEach(page => {
		  const { width, height } = page.getSize();
		  var textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
		  const { x, y } = getCoordinates(page, watermarkText, fontSize,helveticaFont,position,textWidth=textWidth);
		  
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
		const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
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