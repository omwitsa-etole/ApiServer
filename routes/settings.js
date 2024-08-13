const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
	res.writeHead(200, { 'Content-Type':'text/html'});
	html = fs.readFileSync('./index.html');
	res.end(html);
})