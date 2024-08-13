const jwt = require('jsonwebtoken');
const config = require('../config/default');


module.exports = function (req, res, next) {
  //Get token from header
  
  const token = req.header('x-auth-token');
  
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
	
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded.user;
	if(req.user.company){
		next();
	}else{
		
		return res.status(401).json({ message: 'Not authorization denied' });
	}
  } catch (error) {
      if (error) throw error.message;
      res.status(401).json({ message: 'Token is not valid'});
  }
}
