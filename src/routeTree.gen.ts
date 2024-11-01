/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as GithubRawLinkConverterImport } from './routes/github-raw-link-converter'
import { Route as DatetimeConverterImport } from './routes/datetime-converter'

// Create/Update Routes

const GithubRawLinkConverterRoute = GithubRawLinkConverterImport.update({
  id: '/github-raw-link-converter',
  path: '/github-raw-link-converter',
  getParentRoute: () => rootRoute,
} as any)

const DatetimeConverterRoute = DatetimeConverterImport.update({
  id: '/datetime-converter',
  path: '/datetime-converter',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/datetime-converter': {
      id: '/datetime-converter'
      path: '/datetime-converter'
      fullPath: '/datetime-converter'
      preLoaderRoute: typeof DatetimeConverterImport
      parentRoute: typeof rootRoute
    }
    '/github-raw-link-converter': {
      id: '/github-raw-link-converter'
      path: '/github-raw-link-converter'
      fullPath: '/github-raw-link-converter'
      preLoaderRoute: typeof GithubRawLinkConverterImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/datetime-converter': typeof DatetimeConverterRoute
  '/github-raw-link-converter': typeof GithubRawLinkConverterRoute
}

export interface FileRoutesByTo {
  '/datetime-converter': typeof DatetimeConverterRoute
  '/github-raw-link-converter': typeof GithubRawLinkConverterRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/datetime-converter': typeof DatetimeConverterRoute
  '/github-raw-link-converter': typeof GithubRawLinkConverterRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/datetime-converter' | '/github-raw-link-converter'
  fileRoutesByTo: FileRoutesByTo
  to: '/datetime-converter' | '/github-raw-link-converter'
  id: '__root__' | '/datetime-converter' | '/github-raw-link-converter'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  DatetimeConverterRoute: typeof DatetimeConverterRoute
  GithubRawLinkConverterRoute: typeof GithubRawLinkConverterRoute
}

const rootRouteChildren: RootRouteChildren = {
  DatetimeConverterRoute: DatetimeConverterRoute,
  GithubRawLinkConverterRoute: GithubRawLinkConverterRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/datetime-converter",
        "/github-raw-link-converter"
      ]
    },
    "/datetime-converter": {
      "filePath": "datetime-converter.tsx"
    },
    "/github-raw-link-converter": {
      "filePath": "github-raw-link-converter.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
