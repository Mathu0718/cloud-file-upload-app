require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Configure AWS S3 Client (SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Store uploaded file details
let uploadedFiles = [];

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload File API
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    const fileInfo = { name: file.originalname, url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}` };
    uploadedFiles.push(fileInfo);

    res.json({ message: "File uploaded successfully", file: fileInfo });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get Uploaded Files API
app.get("/files", (req, res) => {
  res.json(uploadedFiles);
});

// Download File API (Signed URL)
app.get("/download/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    const url = await getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: 60 });

    res.json({ downloadUrl: url });
  } catch (error) {
    console.error("Download Link Error:", error);
    res.status(500).json({ error: "Download link error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
