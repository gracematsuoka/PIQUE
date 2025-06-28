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

const userItemRoutes = require('./routes/user-items');
app.use('/api/user-items', userItemRoutes);

const ItemRoutes = require('./routes/items');
app.use('/api/items', ItemRoutes);

const PostRoutes = require('./routes/posts');
app.use('/api/posts', PostRoutes);

const BoardRoutes = require('./routes/boards');
app.use('/api/boards', BoardRoutes);

const FollowRoutes = require('./routes/follows');
app.use('/api/follows', FollowRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(8000, () => console.log("Server running on port 8000"));
  })