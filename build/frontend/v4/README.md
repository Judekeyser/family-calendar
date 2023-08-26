# Frontend - Setup

## Destination build

Every production build go in the `/dist` folder.
This folder must already contain asserts and `index.html` file.

## JavaScript build

The JavaScript of the application is managed by Webpack. All sources
are found in `/src/js`. The Webpack live-reload server can be run using
```
npm start run
```
The result of the build is a `/dist/main.js` file.

## CSS build

The CSS uses **Less.js** library. Because the CSS is included through an hyperlink
in the HTML document, we do not go through Webpack to build it. The CSS might be
watched with the `less-server.js` helper file. This file emits a file in `/dist`,
which in turn triggers the Webpack detection.
