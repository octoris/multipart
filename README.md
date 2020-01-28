# Multipart

A multipart middleware for octoris

## Install

You can install this middleware via npm

```cli
npm i @octoris/multipart
```

## Options

There are some options multipart accepts

- mimeTypes: `Array` - An array of mimetype strings to accept and only accpet (leave empty to ignore mimetypes)
- maxSize: `Number` - The maximum size (in mb) the file can be. Defaults to 5
- uploadDir: `String` - A location you'd like to write uploaded files too, leave blank to not upload files


## Usage

```js
const { router, response, methods} = require('octoris')
const multipart = require('@octoris/multipart')

function handler () {
  return response.send(200, 'Okay!')
}

const home = router.route(['/'], [methods.GET(handler)])

router.composeRoutes({}, [home], multipart({ uploadDir: './tmp' }))
```
