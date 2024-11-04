// src/Popup.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert' // Assuming you have an Alert component
import { Progress } from '@/components/ui/progress'
import { FaExclamationTriangle } from 'react-icons/fa'
import '@/github-raw-link-converter.css' // Optional: Remove if Shadcn UI handles all styling
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/')({
  component: GithubRawLinkConverter,
})
function GithubRawLinkConverter() {
  const [inputUrl, setInputUrl] = useState<string>('')
  const [fetchParams, setFetchParams] = useState<GitHubURLComponents>({
    username: '',
    repo: '',
    branch: '',
    path: '',
  })
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false)
  const [outputUrl, setOutputUrl] = useState<string>('')

  const repos = useFetchInitialResource(fetchParams, triggerFetch)
  // Handle the final output and clipboard copying
  useEffect(() => {
    if (!repos.isLoading && !repos.isError && repos.data) {
      const content = repos.data
      if (Array.isArray(content)) {
        // Handle directory contents
        const filePaths = content.map((item) => item.download_url)
        const finalStr = filePaths.join('\n')
        setOutputUrl(finalStr)
        navigator.clipboard
          .writeText(finalStr)
          .then(() => {
            alert('Raw URL(s) copied to clipboard!')
          })
          .catch(() => {
            alert('Failed to copy to clipboard.')
          })
      } else {
        // Handle single file
        const output = content.download_url
        setOutputUrl(output)
        navigator.clipboard
          .writeText(output)
          .then(() => {
            alert('Raw URL(s) copied to clipboard!')
          })
          .catch(() => {
            alert('Failed to copy to clipboard.')
          })
      }
      // Reset triggerFetch to allow future conversions
      setTriggerFetch(false)
    }
  }, [repos, fetchParams])

  const parseInputUrl = () => {
    const trimmedUrl = inputUrl.trim()
    if (trimmedUrl) {
      const parsed = parseGitHubURL(trimmedUrl)
      setFetchParams(parsed)
      setTriggerFetch(true)
    } else {
      alert('Invalid GitHub URL. Please check and try again.')
    }
  }

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
        disabled={repos.isLoading}
        className="mb-4"
      />
      <Button
        onClick={parseInputUrl}
        disabled={repos.isLoading || !inputUrl.trim()}
        className="w-full mb-4"
      >
        {repos.isLoading ? 'Converting...' : 'Convert'}
      </Button>

      {/* Progress Bar */}
      {repos.isLoading && (
        <div className="mb-4">
          <Progress className="w-full" />
        </div>
      )}

      {/* Error Message */}
      {repos.isError && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2" />
            <span>{repos.error.message}</span>
          </div>
        </Alert>
      )}

      {/* Warning Note - Always Shown */}
      <Alert variant="default" className="mb-4">
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

      {/* Output Textarea */}
      {outputUrl && (
        <Textarea
          value={outputUrl}
          readOnly
          placeholder="Raw URL(s) will appear here"
          rows={10}
          disabled={repos.isLoading}
          className="mb-4"
        />
      )}
    </div>
  )
}
interface GitHubURLComponents {
  username: string
  repo: string
  branch: string
  path: string
}

// Constants for Exponential Backoff
const MAX_RETRIES = 5
const INITIAL_DELAY = 1000 // 1 second

// Helper function to perform fetch with exponential backoff
const fetchWithExponentialBackoff = async (
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_DELAY,
): Promise<Response> => {
  try {
    const response = await fetch(url, options)
    if (response.ok || response.status === 404 || response.status === 403) {
      // Return response if successful, resource not found, or forbidden
      return response
    }
    if (retries > 0 && (response.status >= 500 || response.status === 429)) {
      // Retry for server errors or too many requests
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      // Retry on network errors
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2)
    }
    throw error
  }
}

// Function to parse GitHub URLs and extract components
const parseGitHubURL = (url: string): GitHubURLComponents => {
  const githubRegex =
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/(?:blob|tree)\/([^\/]+)\/(.+)$/
  const match = url.match(githubRegex)

  if (!match) {
    throw new Error('Invalid GitHub URL format.')
  }

  const [, username, repo, branch, path] = match
  return { username, repo, branch, path }
}

const githubFileResponseSchema = z.object({
  name: z.string(),
  path: z.string(),
  sha: z.string(),
  size: z.number(),
  url: z.string().url(),
  html_url: z.string().url(),
  git_url: z.string().url(),
  download_url: z.string().url(),
  type: z.string(),
  content: z.string().optional(),
})
const githubFileResponseSchemaArraySchema = z.array(githubFileResponseSchema)

type GithubFileResponseSchemaType = z.infer<
  typeof githubFileResponseSchema | typeof githubFileResponseSchemaArraySchema
>

// Custom Hook to fetch initial GitHub resource (file or directory)
const useFetchInitialResource = (
  components: GitHubURLComponents,
  fetchTriggered: boolean,
) => {
  const { username, repo, branch, path } = components

  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${encodeURIComponent(
    path,
  )}?ref=${encodeURIComponent(branch)}`

  return useQuery({
    queryKey: ['initialResource', username, repo, branch, path],
    queryFn: async () => {
      const response = await fetchWithExponentialBackoff(apiUrl)

      if (response.status === 404) {
        throw new Error(
          `Resource not found. Please check the repository, branch, and path.\nAPI URL: ${apiUrl}`,
        )
      }

      if (response.status === 403) {
        throw new Error(
          `Access forbidden. You might have exceeded the GitHub API rate limits.\nPlease try again later or authenticate your requests.\nAPI URL: ${apiUrl}`,
        )
      }

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}\nAPI URL: ${apiUrl}`,
        )
      }

      const dataPromise: Promise<GithubFileResponseSchemaType> = response.json()
      return dataPromise
    },
    enabled:
      username !== '' &&
      repo !== '' &&
      branch !== '' &&
      path !== '' &&
      fetchTriggered,
  })
}
