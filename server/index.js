const express = require("express");
const app = express();
const logger = require("morgan");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const upload=require("./utils/multer")
const cloudinary = require("./config/cloudinary");

const cors = require("cors");
dotenv.config();

const { connectdb } = require("./config/db");

//ROUTES

const authRoutes = require("./routes/authRoutes.js");
const postRoutes = require("./routes/postRoutes.js");


app.use(cors({
  origin: ['https://blog-app-client-ten.vercel.app/', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

//FILE UPLOAD

app.post("/api/upload", upload.single("file"), async function (req, res) {
    try {
      const file = req.file;
  
      // Upload the file to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
        folder: "blog-images",
        use_filename: true,
        unique_filename: false 
      });
  
      res.status(200).json(cloudinaryResponse.secure_url);
    } catch (error) {
      console.error(error);
      res.status(500).json("Something went wrong.");
    }
  });
  
//Routes
app.use("/api", authRoutes);
app.use("/api/posts", postRoutes);

app.use("/", (req, res) => {
  res.send("works");
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  connectdb();
  console.log("server started");
});
