"use client";

import Image from "next/image";
import styles from "./page.module.css";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);

  // Fetch files from the API
  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/file");
      const data = await res.json();

      if (data.success) {
        setFiles(data.files);
        setFilteredFiles(data.files); // Display all files by default
      } else {
        setError("Failed to load files.");
      }
    } catch (error) {
      setError("Error fetching files.");
      console.error(error);
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Update filtered files based on search query
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredFiles(files); // Show all files if search query is empty
    } else {
      const filtered = files.filter((file) =>
        file.key.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  };

  // Function to make call to internal API route to upload file.
  // Modified code from https://ethanmick.com/how-to-upload-a-file-in-next-js-13-app-directory/
  const handleFileUpload = async (event) => {
    event.preventDefault(); // Prevents default form behaviour

    // If no file in form, do nothing and break from function
    if (!file) {
      return;
    }

    try {
      // Creates a const to store the file the user uploads to form.
      const data = new FormData()
      data.set('file', file)

      // Makes the POST request to the '/api/file/ internal API endpoint with the file as the body.
      const res = await fetch('/api/file', {
        method: 'POST',
        body: data
      })
      // handle the error
      if (!res.ok) throw new Error(await res.text())
    } catch (e) {
      // Handle errors here
      console.error(e)
    }
  }

  // Download file function
  const handleDownload = async (key) => {
    try {
      const res = await fetch(`/api/file/download?key=${encodeURIComponent(key)}`);
      const data = await res.json();

      if (data.success) {
        // Trigger file download
        const link = document.createElement("a");
        link.href = data.url;
        link.download = key; // Name file as key or customize as needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Error downloading file:", data.message);
      }
    } catch (error) {
      console.error("Error fetching download URL:", error);
    }
  };

  // Group files by type
  const groupedFiles = filteredFiles.reduce((acc, file) => {
    const fileType = file.type || 'Unknown'; // Handle files without a type
    if (!acc[fileType]) {
      acc[fileType] = [];
    }
    acc[fileType].push(file);
    return acc;
  }, {});

  // Filter files based on the selected type and search query
  const displayedFiles = selectedFileType
    ? groupedFiles[selectedFileType]?.filter((file) =>
        file.key.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : filteredFiles.filter((file) =>
        file.key.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className={styles.container}>
      {/* Upload Section */}
      <section className={styles.uploadSection}>
        <h1 style={{ marginBottom: '20px' }}>Cloud Storage Application</h1>
        <p style={{ marginBottom: '25px' }}>Drag and drop files below to upload them to the cloud.</p>
        <form onSubmit={handleFileUpload}>
          <input 
            type="file" 
            multiple 
            onChange={(e) => setFile(e.target.files?.[0])} 
            style={{ marginBottom: '20px' }} 
          />
          <button type="submit" style={{ marginBottom: '20px' }}>Upload</button>
        </form>
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
        </div>
<h2 style={{ marginBottom: '20px' }}>Your Files</h2>
        {error ? (
          <p>{error}</p>
        ) : (
          <div>
            {/* File Type Headers */}
            <div className={styles.fileTypeHeaders}>
              {Object.keys(groupedFiles).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFileType(selectedFileType === type ? null : type)}
                  style={{
                    textTransform: 'capitalize',
                    margin: '10px 5px',
                    padding: '10px',
                    backgroundColor: selectedFileType === type ? '#d3d3d3' : '#202039',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    color: selectedFileType === type ? 'black' : 'white'
                  }}
                >
                  {type} ({groupedFiles[type].length})
                </button>
              ))}
            </div>

            {/* Display Files of Selected Type */}
            <div className={styles.selectedFilesSection} style={{ marginTop: '20px' }}>
              {selectedFileType && (
                <h3>{selectedFileType} Files</h3>
              )}
              {displayedFiles.length > 0 ? (
                <ul style={{listStyleType: 'none'}}>
                  {displayedFiles.map((file) => (
                    <li key={file.key}>
                      <br/>
                      {file.key.slice(file.key.lastIndexOf('/')+1, file.key.length)} &emsp;
                      <button onClick={() => handleDownload(file.key)}>Download</button><br/><br/>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No files found.</p>
              )}
            </div>
          </div>
        )}
      </section>
      {/* Footer Section */}
    <footer className={styles.footer}>
      <p>&copy; 2024 Cloud Storage Application. All rights reserved.</p>
    </footer>
    </div>
  );
};
