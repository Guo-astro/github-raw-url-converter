/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DatetimeConverterImport } from './routes/datetime-converter'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const DatetimeConverterRoute = DatetimeConverterImport.update({
  id: '/datetime-converter',
  path: '/datetime-converter',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/datetime-converter': {
      id: '/datetime-converter'
      path: '/datetime-converter'
      fullPath: '/datetime-converter'
      preLoaderRoute: typeof DatetimeConverterImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/datetime-converter': typeof DatetimeConverterRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/datetime-converter': typeof DatetimeConverterRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/datetime-converter': typeof DatetimeConverterRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/datetime-converter'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/datetime-converter'
  id: '__root__' | '/' | '/datetime-converter'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DatetimeConverterRoute: typeof DatetimeConverterRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DatetimeConverterRoute: DatetimeConverterRoute,
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
        "/",
        "/datetime-converter"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/datetime-converter": {
      "filePath": "datetime-converter.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
