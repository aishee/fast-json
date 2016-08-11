'use strict'

function build(schema) {
  /*eslint no-new-func: "off"*/
  var code = `
  'use strict'

  ${$asString.toString()}
  ${$asStringSmall.toString()}
  ${$asStringLong.toString()}
  ${$asNumber.toString()}
  ${$asNull.toString()}
  ${$asBoolean.toString()}
  `

  var main

  switch (schema.type) {
    case 'object':
      main = '$main'
      code = buildObject(schema, code, main)
      break
    case 'string':
      main = $asString.name
      break
    case 'integer':
    case 'number':
      main = $asNumber.name
      break
    case 'boolean':
      main = $asBoolean.name
      break
    case 'null':
      main = $asNull.name
      break
    case 'array':
      main = '$main'
      code = buildArray(schema, code, main)
      break
    default:
      throw new Error(`${schema.type} unspported`)
  }
  code += `
    ;
    return ${main}
  `
  return (new Function(code))()
}

function $asNull () {
  return 'null'
}

function $asNumber (i) {
  var num = Number(i)
  if(isNaN(num)) {
    return 'null'
  } else {
    return '' + i
  }
}
function $asBoolean (bool) {
  return bool && 'true' || 'false'
}

function $asString (str) {
  if (str instanceof Date) {
    return '"' + str.toISOString() + '"'
  } else if (typeof str !== 'string') {
    str = str.toString()
  }

  if(str.length < 42) {
    return $asStringSmall(str)
  } else {
    return $asStringLong(str)
  }
}

function $asStringLong (str) {
  var result = ''
  var l = str.length
  var i

  for (;(i = str.indexOf('"')) >= 0 && i < l;) {
    result += str.slice(0, i) + '\\"'
    str = str.slice(i + 1)
    l = str.length
  }
  if (l > 0) {
    result += str
  }
  return '"' + result + '"'
}

function $asStringSmall(str) {
  var result = ''
  var last = 0
  var l = str.length
  for (var i = 0 ; i < l; i++) {
    if(str[i] === '"') {
      result += str.slice(last, i) + '\\"'
      last = i + 1
    }
  }
  if(last === 0) {
    result = str
  } else {
    result += str.slice(last)
  }
  return '"' + result + '"'
}

function buildObject (schema, code, name) {
  code += `
    function ${name} (obj) {
      var json = '{'
  `
  var laterCode = ''
  Object.keys(schema.properties).forEach((key, i, a) => {
    code += `
      json += '${$asString(key)}:'
     `
    const result = nested(laterCode, name, '.' + key, schema.properties[key])

    code += result.code
    laterCode = result.laterCode

    if(i < a.length - 1) {
      code += 'json += \', \''
    }
  })
  code += `
    json += '}'
    return json
   }
  `
  code += laterCode
  return code
}

function buildArray(schema, code, name) {
  code += `
  function ${name} (obj) {
    var json = '['
  `
  var laterCode = ''
  const result = nested(laterCode, name, '[i]', schema.items)
  code += `
  const l = obj.length
  const w = l - 1
  for (var i = 0; i < l; i++) {
    ${result.code}
    if(i < w) {
      json += ','
    }
  }
  `
  laterCode = result.laterCode
  code += `
  json += ']'
  return json
}
  `
  code += laterCode
  return code

}


function nested(laterCode, name, key, schema) {
  var code = ''
  var funcName
  const type = schema.type
  switch (type) {
    case 'null':
      code += `
      json += $asNull()
      `
      break
    case 'string':
      code += `
      json += $asString(obj${key})
      `
      break
    case 'number':
    case 'integer':
      code += `
      json += $asNumber(obj${key})
      `
      break
    case 'boolean':
      code += `
      json += $asBoolean(obj${key})
      `
      break
    case 'object':
      funcName = (name + key).replace(/[-.\[\]]/g, '')
      laterCode = buildObject(schema, laterCode, funcName)
      code += `
        json += ${funcName}(obj${key})
      `
      break
    case 'array':
      funcName = (name + key).replace(/[-.\[\]]/g, '')
      laterCode = buildArray(schema, laterCode, funcName)
      code += `
        json += ${funcName}(obj${key})
      `
      break
    default:
      throw new Error(`${type} unsupported`)
  }
  return {
    code,
    laterCode
  }
}

module.exports = build
