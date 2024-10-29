// src/api/github.ts

export interface GitHubURLComponents {
  username: string;
  repo: string;
  branch: string;
  path: string;
}

// Function to parse GitHub URLs and extract components
export const parseGitHubURL = (url: string): GitHubURLComponents => {
  const githubRegex =
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:blob|tree)\/([^\/]+)\/(.+)$/;
  const match = url.match(githubRegex);

  if (!match) {
    throw new Error("Invalid GitHub URL format.");
  }

  const [, username, repo, branch, path] = match;
  return { username, repo, branch, path };
};

// Function to convert a single file path to its raw URL
export const convertToRawUrl = ({
  username,
  repo,
  branch,
  path,
}: GitHubURLComponents): string => {
  return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`;
};

// Function to fetch contents from GitHub API
export const fetchGitHubContents = async (
  username: string,
  repo: string,
  branch: string,
  path: string,
  token?: string // Optional: For authenticated requests
): Promise<any[]> => {
  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${encodeURIComponent(
    path
  )}?ref=${encodeURIComponent(branch)}`;

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const response = await fetch(apiUrl, { headers });

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
