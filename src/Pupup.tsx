// src/Popup.tsx
import React, { useState } from "react";
import "./Popup.css";

const Popup: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string>("");

  const convertToRawUrl = (url: string): string => {
    const githubRegex =
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const match = url.match(githubRegex);

    if (!match) {
      throw new Error("Invalid GitHub URL.");
    }

    const [, username, repo, branchOrCommit, filePath] = match;
    return `https://raw.githubusercontent.com/${username}/${repo}/${branchOrCommit}/${filePath}`;
  };

  const handleConvert = () => {
    try {
      const rawUrl = convertToRawUrl(inputUrl.trim());
      setOutputUrl(rawUrl);
      navigator.clipboard.writeText(rawUrl);
      alert("Raw URL copied to clipboard!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred.");
      }
      setOutputUrl("");
    }
  };

  return (
    <div className="popup-container">
      <h2>GitHub URL to Raw Converter</h2>
      <textarea
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="Paste your GitHub URL here"
      />
      <button onClick={handleConvert}>Convert</button>
      <textarea
        value={outputUrl}
        readOnly
        placeholder="Raw URL will appear here"
      />
    </div>
  );
};

export default Popup;
