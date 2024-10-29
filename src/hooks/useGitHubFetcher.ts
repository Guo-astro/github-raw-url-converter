// src/hooks/useGitHubFetcher.ts

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  parseGitHubURL,
  fetchGitHubContents,
  convertToRawUrl,
} from "../utils/github";

interface FetchResult {
  rawUrls: string[];
  totalFiles: number;
  totalFolders: number;
}

const MAX_DEPTH = 5;

/**
 * Custom hook to fetch GitHub repository contents up to a specified depth.
 * @param url - The GitHub URL to fetch contents from.
 * @param token - Optional GitHub token for authenticated requests.
 * @returns An object containing the fetch function and fetch results.
 */
export const useGitHubFetcher = (url: string, token: string = "") => {
  const [trigger, setTrigger] = useState<number>(0);

  const fetchContents = async (): Promise<FetchResult> => {
    if (!url) {
      throw new Error("No URL provided.");
    }

    // Parse the input URL
    const { username, repo, branch, path } = parseGitHubURL(url.trim());

    if (!username || !repo || !branch || path === undefined) {
      throw new Error("Invalid GitHub URL format.");
    }

    // Initialize queues for directories to fetch
    let currentDepth = 0;
    let directoriesToFetch: string[] = [path];
    const allFilePaths: string[] = [];
    let folderCount = 0;

    while (directoriesToFetch.length > 0 && currentDepth < MAX_DEPTH) {
      // Fetch all directories at the current depth in parallel
      const fetchPromises = directoriesToFetch.map((dirPath) =>
        fetchGitHubContents(username, repo, branch, dirPath, token)
      );

      const results = await Promise.all(fetchPromises);

      // Reset directoriesToFetch for the next depth level
      directoriesToFetch = [];

      // Process fetched contents
      results.forEach((contents) => {
        contents.forEach((item) => {
          if (item.type === "file") {
            allFilePaths.push(item.path);
          } else if (item.type === "dir") {
            directoriesToFetch.push(item.path);
            folderCount += 1;
          }
          // Ignoring other types like symlinks, submodules, etc.
        });
      });

      currentDepth += 1;
    }

    if (currentDepth >= MAX_DEPTH && directoriesToFetch.length > 0) {
      console.warn(`Maximum directory depth of ${MAX_DEPTH} reached.`);
    }

    if (allFilePaths.length === 0) {
      throw new Error("No files found in the specified directory.");
    }

    // Convert all file paths to raw URLs
    const rawUrls = allFilePaths.map((filePath) =>
      convertToRawUrl({ username, repo, branch, path: filePath })
    );

    return {
      rawUrls,
      totalFiles: allFilePaths.length,
      totalFolders: folderCount,
    };
  };

  const query = useQuery(["githubFetch", trigger], fetchContents, {
    enabled: false, // Manual triggering
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error: any) => {
      console.error("GitHub fetch error:", error);
    },
  });

  const triggerFetch = () => {
    setTrigger((prev) => prev + 1);
  };

  return { ...query, triggerFetch };
};
