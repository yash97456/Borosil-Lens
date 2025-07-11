module.exports = (req, res, next) => {
  // Example: check for a token or session
  // if (!req.headers.authorization) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  next();
};
