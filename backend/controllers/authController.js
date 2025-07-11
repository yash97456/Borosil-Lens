const User = require("../models/User");

exports.login = async (req, res, next) => {
  const { userId, password } = req.query;
  try {
    const user = await User.findByCredentials(userId, password);
    if (user) {
      res.json({ success: true, role: user.role });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getPermissions = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const role = await User.getRole(userId);
    res.json({ userId, role });
  } catch (err) {
    next(err);
  }
};
