// src/Popup.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert"; // Assuming you have an Alert component
import { Progress } from "@/components/ui/progress";
import { FaExclamationTriangle } from "react-icons/fa"; // Import the missing icon
import "./Popup.css"; // Optional: Remove if Shadcn UI handles all styling

interface GitHubURLComponents {
  username: string;
  repo: string;
  branch: string;
  path: string;
}

// Constants for Exponential Backoff
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000; // 1 second

// Helper function to perform fetch with exponential backoff
const fetchWithExponentialBackoff = async (
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_DELAY
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (response.ok || response.status === 404 || response.status === 403) {
      // Return response if successful, resource not found, or forbidden
      return response;
    }
    if (retries > 0 && (response.status >= 500 || response.status === 429)) {
      // Retry for server errors or too many requests
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      // Retry on network errors
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Function to parse GitHub URLs and extract components
const parseGitHubURL = (url: string): GitHubURLComponents => {
  const githubRegex =
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:blob|tree)\/([^\/]+)\/(.+)$/;
  const match = url.match(githubRegex);

  if (!match) {
    throw new Error("Invalid GitHub URL format.");
  }

  const [, username, repo, branch, path] = match;
  return { username, repo, branch, path };
};

const Popup: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Function to convert a single file path to its raw URL
  const convertToRawUrl = ({
    username,
    repo,
    branch,
    path,
  }: GitHubURLComponents): string => {
    return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`;
  };

  // Function to fetch contents from GitHub API with exponential backoff
  const fetchGitHubContents = async (
    username: string,
    repo: string,
    branch: string,
    path: string
  ): Promise<any[]> => {
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${encodeURIComponent(
      path
    )}?ref=${encodeURIComponent(branch)}`;
    const response = await fetchWithExponentialBackoff(apiUrl);

    if (response.status === 404) {
      throw new Error(
        `Resource not found. Please check the repository, branch, and path.\nAPI URL: ${apiUrl}`
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Access forbidden. You might have exceeded the GitHub API rate limits.\nPlease try again later or authenticate your requests.\nAPI URL: ${apiUrl}`
      );
    }

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}\nAPI URL: ${apiUrl}`
      );
    }

    return response.json();
  };

  // Recursive function to collect all file paths in a directory
  const collectFilePaths = async (
    username: string,
    repo: string,
    branch: string,
    path: string,
    filePaths: string[] = []
  ): Promise<string[]> => {
    const contents = await fetchGitHubContents(username, repo, branch, path);

    for (const item of contents) {
      if (item.type === "file") {
        filePaths.push(item.path);
      } else if (item.type === "dir") {
        await collectFilePaths(username, repo, branch, item.path, filePaths);
      }
      // Ignoring other types like symlinks, submodules, etc.
    }

    return filePaths;
  };

  const handleConvert = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Parse the input URL
      const { username, repo, branch, path } = parseGitHubURL(inputUrl.trim());

      // Fetch to determine if it's a file or directory with exponential backoff
      const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${encodeURIComponent(
        path
      )}?ref=${encodeURIComponent(branch)}`;
      const response = await fetchWithExponentialBackoff(apiUrl);

      if (response.status === 404) {
        throw new Error(
          `Resource not found. Please check the repository, branch, and path.\nAPI URL: ${apiUrl}`
        );
      }

      if (response.status === 403) {
        throw new Error(
          `Access forbidden. You might have exceeded the GitHub API rate limits.\nPlease try again later or authenticate your requests.\nAPI URL: ${apiUrl}`
        );
      }

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}\nAPI URL: ${apiUrl}`
        );
      }

      const data = await response.json();

      let rawUrls: string[] = [];

      if (Array.isArray(data)) {
        // It's a directory
        const filePaths = await collectFilePaths(username, repo, branch, path);
        if (filePaths.length === 0) {
          throw new Error("No files found in the specified directory.");
        }
        rawUrls = filePaths.map((filePath) =>
          convertToRawUrl({ username, repo, branch, path: filePath })
        );
      } else if (data.type === "file") {
        // It's a single file
        const rawUrl = convertToRawUrl({ username, repo, branch, path });
        rawUrls.push(rawUrl);
      } else {
        throw new Error("Unsupported GitHub content type.");
      }

      // Join all raw URLs with newlines
      const output = rawUrls.join("\n");
      setOutputUrl(output);

      // Copy to clipboard
      await navigator.clipboard.writeText(output);
      alert("Raw URL(s) copied to clipboard!");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        alert(`Error: ${error.message}`);
      } else {
        setErrorMessage("An unexpected error occurred.");
        alert("An unexpected error occurred.");
      }
      setOutputUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        GitHub URL to Raw Converter
      </h2>
      <Textarea
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="Paste your GitHub URL here"
        rows={4}
        disabled={loading}
        className="mb-4"
      />
      <Button
        onClick={handleConvert}
        disabled={loading || !inputUrl.trim()}
        className="w-full mb-4"
      >
        {loading ? "Converting..." : "Convert"}
      </Button>

      {/* Progress Bar */}
      {loading && (
        <div className="mb-4">
          <Progress className="w-full" />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {/* Warning Note - Always Shown */}
      <Alert variant="warning" className="mb-4">
        <div className="flex items-start">
          <FaExclamationTriangle className="w-5 h-5 mr-2 mt-1" />
          <div>
            <strong>Important Information:</strong>
            <ul className="list-disc list-inside mt-1">
              <li>
                Unauthenticated requests to the GitHub API are subject to rate
                limits. If you encounter rate limit issues, please wait before
                making additional requests or consider authenticating your
                requests.
              </li>
              <li>
                Accessing private repositories requires authentication tokens,
                which are not supported in this tool.
              </li>
              <li>
                Ensure the GitHub URL is correctly formatted and that the
                repository, branch, and path exist.
              </li>
              <li>
                Some directories may contain a large number of files, which
                could impact performance.
              </li>
              <li>
                If you receive a <strong>403 Forbidden</strong> error, it may
                indicate that you have exceeded the GitHub API rate limits.
                Please try again later.
              </li>
            </ul>
          </div>
        </div>
      </Alert>

      <Textarea
        value={outputUrl}
        readOnly
        placeholder="Raw URL(s) will appear here"
        rows={10}
        disabled={loading}
        className="mb-4"
      />
    </div>
  );
};

export default Popup;
