const express = require('express')
const router = express.Router()
const axios = require('axios');


const apiKey = 'your-gemini-api-key';
const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCTyr8lHE_v3dxXor1OmGvWv-YXuiP1nKA'; // Example endpoint

const prompt = "Tell me a joke about a doctor and a file.";

const generateJoke = async () => {
    try {
        const response = await axios.post(apiEndpoint, {
           
			contents: [
				{
					parts: [
						{
							text: prompt
						}
					]
				}
			]
			
        });

        // Assuming the API response contains the joke inn
		const datas = response.data.joke || response.data.content || response.data;
        //const joke = response.data.joke || response.data.content || response.data;  // Adjust depending on the API response structure
        const joke = datas.candidates[0].content.parts[0].text;
		//console.log('Generated Joke:', joke);
		return joke;
    } catch (error) {
        console.error('Error generating joke:', error.response ? error.response.data : error.message);
		return null;
	}
};

// Call the function


router.post("/ai/request",async( req,res)=>{
	try{
		const data = req.body;
	  const result = await generateJoke();
	  res.status(200).json({success:true,result: result});
	}catch(error){
		console.log(error);
		res.status(500).send('Server Error')
	}
})

module.exports = router;
