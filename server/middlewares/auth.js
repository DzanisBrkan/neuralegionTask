const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log(req.headers);
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    const decodedToken = jwt.verify(token, "MJDLOPRTMA");
    req.user = decodedToken;
    next();
  } catch(err) {
    res.status(401).json('Niste prijavljeni!');
    console.log(err)
  }
};