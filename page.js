"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  // Function to make call to internal API route to upload file.
  // Modified code from https://ethanmick.com/how-to-upload-a-file-in-next-js-13-app-directory/
  const handleFileUpload = async (event) => {
    event.preventDefault();

    if(!file) {
      return;
    }

    try {
      const data = new FormData()
      data.set('file', file)

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

  // const handleSearch = () => {
  //   const filteredFiles = files.filter(file => file.name.includes(searchQuery));
  //   setFiles(filteredFiles);
  // };

    const displayFiles = async () =>{
      const res = await fetch('/api/file').then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => console.error("Error:", error));;
    }

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
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginRight: '10px', padding: '8px' }}
          />
          <button>Search</button>
          <button onClick={displayFiles}>Test</button>
        </div>
        
        <h2 style={{ marginBottom: '20px' }}>Your Files</h2>
        <p style={{ marginTop: '20px' }}>No files uploaded yet.</p>
      </section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>© 2024 Cloud Storage Service. All rights reserved.</p>
      </footer>
    </div>
  );
}
