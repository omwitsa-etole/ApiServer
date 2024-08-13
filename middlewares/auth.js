const jwt = require('jsonwebtoken');
const config = require('../config/default');

module.exports = function (req, res, next) {
  //Get token from header
  
  const token = req.header('x-auth-token');

  //Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
	
	if(token===null || token === "None" || token === false || token === "false"){
		return res.status(401).json({ message: 'No token, authorization denied' });
	}
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded.user;

    next();
  } catch (error) {
      if (error) throw error.message;
      res.status(401).json({ message: 'Token is not valid'});
  }
}
