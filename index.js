const Busboy = require('busboy')
const { withDefaults } = require('kyanite')

function multipart (options = {}) {
  const opts = withDefaults({
    extensions: [],
    mimeTypes: [],
    maxSize: 5
  }, options)

  return function (ctx) {
    const results = []
    const fieldResults = {}

    return new Promise ((resolve, reject) => {
      const bBoy = new Busboy({ headers: ctx.request.headers })

      bBoy.on('file', (_, file, __, ___, mimetype) => {
        if (!opts.mimeTypes.include(mimetype)) {
          return reject(new Error(`${mimetype} mimetype not accepted`))
        }

        file.on('data', data => {
          if (data.length > opts.maxSize * 1000000) {
            return reject(new Error(`File size exceeds ${opts.maxSize}mb limit`))
          }

          results.push(data)
        })
      })

      bBoy.on('field', (fieldName, val) => {
        fieldResults[fieldName] = val
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
