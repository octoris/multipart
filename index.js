const fs = require('fs')
const path = require('path')
const Busboy = require('busboy')

function multipart (options = {}) {
  const opts = {
    mimeTypes: [],
    maxSize: 5,
    ...options
  }

  return function (ctx) {
    const results = []
    const fieldResults = {}

    return new Promise ((resolve, reject) => {
      const bBoy = new Busboy({ headers: ctx.request.headers })

      bBoy.on('file', (_, file, filename, __, mimetype) => {
        const fileResults = { filename, data: [] }

        if (opts.mimeTypes.length && !opts.mimeTypes.includes(mimetype)) {
          return reject(new Error(`${mimetype} mimetype not accepted`))
        }

        file.on('data', data => {
          if (data.length > opts.maxSize * 1000000) {
            return reject(new Error(`File size exceeds ${opts.maxSize}mb limit`))
          }

          fileResults.data.push(data)

          if (opts.uploadDir) {
            fs.writeFile(path.join(opts.uploadDir, filename), data, err => {
              if (err) {
                return reject(err)
              }
            })
          }
        })

        file.on('end', () => {
          results.push(fileResults)
        })
      })

      bBoy.on('field', (fieldName, val) => {
        const field = fieldResults[fieldName]
        const hasField = fieldResults.hasOwnProperty(fieldName)

        if (hasField && Array.isArray(field)) {
          fieldResults[fieldName] = [...field, val]
        } else if (hasField) {
          fieldResults[fieldName] = [field, val]
        } else {
          fieldResults[fieldName] = val
        }
      })

      bBoy.on('finish', () => {
        ctx.files = results
        ctx.body = fieldResults

        return resolve(ctx)
      })

      ctx.request.pipe(bBoy)
    })
  }
}

module.exports = multipart
