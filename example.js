'use strict'

const fastJson = require('.')
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    age: {
      description: 'Age in years',
      type: 'integer'
    },
    now: {
      type: 'string'
    }
  }
})

console.log(stringify({
  firstName: 'Aishee',
  lastName: 'Nguyen',
  age: 32,
  now: new Date()
}))
