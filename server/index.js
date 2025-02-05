const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const multer = require("multer");
const userRoute = require("./Routes/userRoute")
const chatRoute = require("./Routes/chatRoute")
const messageRoute = require("./Routes/messageRoute")

const app = express()
require("dotenv").config()

app.use(express.json())
app.use(cors())
app.use("/api/users", userRoute)
app.use("/api/chats", chatRoute)
app.use("/api/messages", messageRoute)
app.use(express.static("public")); 

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/"); // Upload files to the public/uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Ensure unique filenames
    },
});

const upload = multer({ storage: storage });

// Route for file upload
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Handle any errors
    try {
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ message: "File uploaded successfully", fileUrl });
        
    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



app.get("/", (req, res) => {
    res.send("Welcome")
})

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI

app.listen(port, (req,res) => {
    console.log(`Server started on port: ${port}..`)
})

mongoose.set('strictQuery', false);
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('MongoDB connection established!')).catch((error) => console.log("MongoDB connection failed..", error.message))