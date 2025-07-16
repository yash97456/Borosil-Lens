const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

(async () => {
  const password = "Borosil@123";
  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  console.log("Admin User ID:", id);
  console.log("Hashed Password:", hashed);
})();
