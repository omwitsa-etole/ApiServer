const twilio = require('twilio');


// Example usage:
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const fromNumber = 'YOUR_TWILIO_PHONE_NUMBER';
const toNumber = 'RECIPIENT_PHONE_NUMBER';
const messageBody = 'Hello from Twilio!';

// Function to send a text message
function sendTextMessage(accountSid, toNumber, messageBody,next) {
  // Initialize Twilio client
  const client = twilio(accountSid, authToken);

  // Send the text message
  client.messages
    .create({
      body: messageBody,
      from: fromNumber,
      to: toNumber
    })
    .then(message => next(message))
    .catch(error => console.error(`Error sending text message: ${error.message}`));
}

