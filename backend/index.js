require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const uploadRoutes = require("./routes/uploadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statsRoutes = require("./routes/statsRoutes");
const codeRoutes = require("./routes/codeRoutes");

app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/login", authRoutes);
app.use("/api/permissions", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/codes", codeRoutes);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
