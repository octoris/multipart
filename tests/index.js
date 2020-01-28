const http = require('http')
const fs = require('fs')
const request = require('supertest')
const test = require('tape')
const multipart = require('../index')

function createServer (opts = {}) {
  const _multi = multipart(opts)

  return http.createServer((request, response) => {
    const context = {
      request,
      response
    }

    _multi(context)
      .then(ctx => {
        ctx.response.writeHead(200, { 'Content-Type': 'applicaton/json' })
        ctx.response.end(JSON.stringify([ctx.body, ctx.files]))
      })
      .catch(err => {
        context.response.writeHead(400, { 'Content-Type': 'text/html' })
        context.response.end(err.message)
      })
  })
}

test('Multipart FIELD Requests', t => {
  request(createServer())
    .post('/user')
    .field('name', 'bobby')
    .field('followers', 25)
    .expect(200)
    .end((err, res) => {
      const [fields] = res.body
      t.error(err, 'No error returned')
      t.same(fields.name, 'bobby', 'The user is bobby')
      t.same(fields.followers, '25', 'Bobby has 25 followers')
      t.end()
    })
})

test('Multipart FILE with write requests', t => {
  request(createServer({ uploadDir: `${__dirname}/tmp` }))
    .post('/upload')
    .type('multipart/form-data')
    .field('names', 'Bobby')
    .field('names', 'George')
    .attach('firstField', 'package.json')
    .expect(200)
    .end((err, res) => {
      const [fields, file] = res.body
      t.error(err, 'No error')
      t.same(fields.names[0], 'Bobby', 'First name is Bobby')
      t.same(fields.names[1], 'George', 'Second name was George')
      t.same(file[0].filename, 'package.json', 'Recieved the package json')
      t.ok(fs.statSync(`${__dirname}/tmp/package.json`), 'Created new json file')
      t.end()
    })
})

test('Multipart multiple FILE uploads', t => {
  request(createServer())
    .post('/upload')
    .type('multipart/form-data')
    .attach('firstField', 'package.json')
    .attach('secondField', 'index.js')
    .expect(200)
    .end((err, res) => {
      t.error(err, 'No error was thrown')
      t.same(res.body[1][0].filename, 'package.json', 'First file sent was a package json')
      t.same(res.body[1][1].filename, 'index.js', 'Second file sent was index.js')
      t.end()
    })
})
