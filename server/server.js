const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(8000, () => console.log("Server running on port 8000"));
  })