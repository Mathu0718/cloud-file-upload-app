import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Handle File Selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Upload File to Backend
  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully!");
      setUploadedFiles([...uploadedFiles, response.data.file]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Cloud File Upload App</h1>
      
      {/* File Input */}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {/* Uploaded Files */}
      <h2>Uploaded Files</h2>
      <ul>
        {uploadedFiles.map((file, index) => (
          <li key={index}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ✅ Correct export statement
export default App;
