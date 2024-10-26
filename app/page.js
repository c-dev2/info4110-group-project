"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    // Add logic to call AWS Lambda function to upload files to S3
  };

  const handleSearch = () => {
    const filteredFiles = files.filter(file => file.name.includes(searchQuery));
    setFiles(filteredFiles);
  };

  return (
    <div className={styles.container}>
      {/* Upload Section */}
      <section className={styles.uploadSection}>
        <h1 style={{ marginBottom: '20px' }}>Cloud Storage Application</h1>
        <p style={{ marginBottom: '25px' }}>Drag and drop files below to upload them to the cloud.</p>
        <input type="file" multiple onChange={handleFileUpload} style={{ marginBottom: '20px' }}/>
        <button onClick={handleFileUpload} style={{ marginBottom: '20px' }}>Upload</button>
      </section>

      {/* Files and Search Section */}
      <section className={styles.filesSection}>
        <div className={styles.searchSection} style={{ marginBottom: '20px' }}>
          <input 
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginRight: '10px', padding: '8px' }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        
        <h2 style={{ marginBottom: '20px' }}>Your Files</h2>
        {files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <Image
                src="/file-icon.png"
                alt="File icon"
                width={50}
                height={50}
                style={{ marginRight: '10px' }}
              />
              <p style={{ marginRight: '10px' }}>{file.name}</p>
              <button>Download</button>
            </div>
          ))
        ) : (
          <p style={{ marginTop: '20px' }}>No files uploaded yet.</p>
        )}
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>© 2024 Cloud Storage Service. All rights reserved.</p>
      </footer>
    </div>
  );
}
