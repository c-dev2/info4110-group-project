"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

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
    if(!file) {
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

  // const handleSearch = () => {
  //   const filteredFiles = files.filter(file => file.name.includes(searchQuery));
  //   setFiles(filteredFiles);
  // };

// const displayFiles = async () =>{
//   const res = await fetch('/api/file').then(response => response.json())
//     .then(data => {
//       console.log(data);
//       })
//     .catch(error => console.error("Error:", error));;
//     }

  return (
    <div className={styles.container}>
      {/* Upload Section */}
      <section className={styles.uploadSection}>
        <h1 style={{ marginBottom: '20px' }}>Cloud Storage Application</h1>
        <p style={{ marginBottom: '25px' }}>Drag and drop files below to upload them to the cloud.</p>
        <form onSubmit={handleFileUpload}>
          <input type="file" multiple onChange={(e) => setFile(e.target.files?.[0])} style={{ marginBottom: '20px' }}/>
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
            onChange={handleSearch}
            style={{ marginRight: '10px', padding: '8px' }}
          />
        </div>
        
        <h2 style={{ marginBottom: '20px' }}>Your Files</h2>
        {error ? (
          <p>{error}</p>
        ) : (
          <ul>
            {filteredFiles.map((file) => (
              <li key={file.key}>
                {file.key} ({file.type}) <button onClick={() => handleDownload(file.key)}>Download</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>© 2024 Cloud Storage Service. All rights reserved.</p>
      </footer>
    </div>
  );
}
