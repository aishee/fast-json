'use strict'

const test = require('tap').test
const validator = require('is-my-json-valid')
const build = require('.')

function buildTest(schema, toStringify) {
  test(`render a ${schema.title} as JSON`, (t) => {
    t.plan(3)

    const validate = validator(schema)
    const stringify = build(schema)
    const output = stringify(toStringify)

    t.deepEqual(JSON.parse(output), toStringify)
    t.equal(output, JSON.stringify(toStringify))
    t.ok(validate(JSON.parse(output), 'valid schema'))
  })
}

buildTest({
  'title': 'basic'
})
