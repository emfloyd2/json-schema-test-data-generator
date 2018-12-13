'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var jsf = require('json-schema-faker');
var _ = require('lodash');
var Chance = require('chance');
var ps = require('prop-search');

var chance = new Chance();
var types = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];

function validate(schema) {
  if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) !== 'object') {
    return false;
  }

  if (_typeof(schema.properties) !== 'object' && typeof schema.type !== 'string') {
    return false;
  }

  return true;
}

function getNegativeTypes(prop) {
  if (!prop || !prop.type || typeof prop.type !== 'string' && !Array.isArray(prop.type)) {
    return;
  }

  var allowedTypes = typeof prop.type === 'string' ? [prop.type] : prop.type;
  if (!allowedTypes.length) {
    return;
  }

  return _.difference(types, allowedTypes, ['object', 'array']);
}

function generateForProp(schema, type, key) {
  var d = jsf(schema);
  var value = void 0;
  if (type === 'string') {
    value = chance.string();
  } else if (type === 'number') {
    value = chance.floating({ min: 0, max: 100, fixed: 2 });
  } else if (type === 'integer') {
    value = chance.integer();
  } else if (type === 'boolean') {
    value = chance.bool();
  } else if (type === 'null') {
    value = null;
  }

  if (key) {
    d[key] = value;
  } else {
    d = value;
  }

  var ret = {
    valid: false,
    data: d,
    message: key ? 'should not work with \'' + key + '\' of type \'' + type + '\'' : 'should not work with type \'' + type + '\''
  };

  if (key) {
    ret.property = key;
  }

  return ret;
}

function generateNegativeType(schema, prop, key) {
  var negativeTypes = getNegativeTypes(prop);
  if (!negativeTypes || !negativeTypes.length) {
    return [];
  }

  var newType = _.sample(negativeTypes);
  return [generateForProp(schema, newType, key)];
}

function generateNegativesForNumber(schema, prop, key) {
  var ret = [];
  if (typeof prop.multipleOf === 'number' && prop.multipleOf >= 0) {
    var d = jsf(schema);
    var nv = prop.multipleOf - 1;
    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    var r = {
      valid: false,
      data: d,
      message: key ? 'should not pass validation for multipleOf property: ' + key : 'should not pass validation for multipleOf'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.maximum === 'number') {
    var _d = jsf(schema);
    var _nv = prop.maximum + 1;
    if (key) {
      _d[key] = _nv;
    } else {
      _d = _nv;
    }

    var _r = {
      valid: false,
      data: _d,
      message: key ? 'should not pass validation for maximum of property: ' + key : 'should not pass validation for maximum'
    };

    if (key) {
      _r.property = key;
    }

    ret.push(_r);
  }
  if (typeof prop.minimum === 'number') {
    var _d2 = jsf(schema);
    var _nv2 = prop.minimum - 1;
    if (key) {
      _d2[key] = _nv2;
    } else {
      _d2 = _nv2;
    }

    var _r2 = {
      valid: false,
      data: _d2,
      message: key ? 'should not pass validation for minimum of property: ' + key : 'should not pass validation for minimum'
    };

    if (key) {
      _r2.property = key;
    }

    ret.push(_r2);
  }

  return ret;
}

function generateNegativesForString(schema, prop, key) {
  var ret = [];
  if (typeof prop.maxLength === 'number') {
    var d = jsf(schema);
    var nv = chance.string({ length: prop.maxLength + 1 });

    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    var r = {
      valid: false,
      data: d,
      message: key ? 'should not pass validation for maxLength of property: ' + key : 'should not pass validation for maxLength'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.minLength === 'number' && prop.minLength > 0) {
    var _d3 = jsf(schema);
    var _nv3 = chance.string({ length: prop.minLength - 1 });

    if (key) {
      _d3[key] = _nv3;
    } else {
      _d3 = _nv3;
    }

    var _r3 = {
      valid: false,
      data: _d3,
      message: key ? 'should not pass validation for minLength of property: ' + key : 'should not pass validation for minLength'
    };

    if (key) {
      _r3.property = key;
    }

    ret.push(_r3);
  }
  if (typeof prop.format === 'string') {
    var _d4 = jsf(schema);
    var _nv4 = chance.string();
    if (key) {
      _d4[key] = _nv4;
    } else {
      _d4 = _nv4;
    }

    var _r4 = {
      valid: false,
      data: _d4,
      message: key ? 'should not pass validation for format of property: ' + key : 'should not pass validation for format'
    };

    if (key) {
      _r4.property = key;
    }

    ret.push(_r4);
  }

  return ret;
}

function generateNegativesForArray(schema, prop, key) {
  var ret = [];
  if (_typeof(prop.items) === 'object' && typeof prop.maxItems === 'number') {
    var d = jsf(schema);

    if (!Array.isArray(d[key])) {
      d[key] = [];
    }

    while (d[key].length <= prop.maxItems) {
      d[key].push(jsf(prop.items));
    }

    ret.push({
      valid: false,
      data: d,
      property: key,
      message: 'should not pass validation for maxItems of property: ' + key
    });
  }

  if (_typeof(prop.items) === 'object' && typeof prop.minItems === 'number') {
    var _d5 = jsf(schema);

    if (!Array.isArray(_d5[key])) {
      _d5[key] = [];
    }

    while (_d5[key].length >= prop.minItems && _d5[key].length > 0) {
      _d5[key].pop();
    }

    ret.push({
      valid: false,
      data: _d5,
      property: key,
      message: 'should not pass validation for minItems of property: ' + key
    });
  }

  if (_typeof(prop.items) === 'object' && prop.uniqueItems === true) {
    var _d6 = jsf(schema);

    if (!Array.isArray(_d6[key])) {
      _d6[key] = [];
    }

    if (!_d6[key].length) {
      _d6[key].push(jsf(prop.items));
    }

    _d6[key].push(_d6[key][0]);

    ret.push({
      valid: false,
      data: _d6,
      property: key,
      message: 'should not pass validation for uniqueItems of property: ' + key
    });
  }

  // generate tests for items schema
  if (_typeof(prop.items) === 'object') {
    var itemData = generate(prop.items);

    itemData.forEach(function (i) {
      var d = jsf(schema);
      var sr = ps.search(d, function (e) {
        return Array.isArray(e[key]);
      }, { separator: '.' });
      if (sr && sr.length && sr[0]) {
        var p = sr[0].path ? sr[0].path.concat('.' + key) : key;
        var nd = [i.data];
        if (typeof prop.minItems === 'number') {
          var extra = _.times(prop.minItems, function () {
            return jsf(prop.items);
          });
          nd.push.apply(nd, _toConsumableArray(extra));
        }
        _.set(d, p, nd);

        ret.push({
          valid: i.valid,
          data: d,
          property: key,
          message: 'within array test: ' + i.message
        });
      }
    });
  }

  return ret;
}

function generateNegativesForObject(schema, prop, key) {
  var ret = [];
  var testsForProp = generate(prop);
  testsForProp = _.reject(testsForProp, function (td) {
    return td.valid;
  });
  testsForProp.forEach(function (td) {
    var d = jsf(schema);
    d[key] = td.data;
    ret.push({
      valid: td.valid,
      data: d,
      property: key,
      message: 'nested object test: ' + td.message
    });
  });

  return ret;
}

function generateExtraConditions(schema, prop, key) {
  var ret = [];
  if (Array.isArray(prop.allOf) && prop.allOf.length) {
    var d = jsf(schema);
    var np = _.cloneDeep(prop);
    np.allOf.pop();
    var newObject = jsf(np);
    d[key] = newObject;
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: 'should not pass validation for allOf of property: ' + key
    });
  }

  return ret;
}

function generateNegativeDetailsForType(schema, prop, key) {
  var type = prop.type;
  var ret = [];
  if (['integer', 'number', 'string', 'array', 'object'].indexOf(type) === -1) {
    return ret;
  }

  if (type === 'integer' || type === 'number') {
    ret.push.apply(ret, _toConsumableArray(generateNegativesForNumber(schema, prop, key)));
  } else if (type === 'string') {
    ret.push.apply(ret, _toConsumableArray(generateNegativesForString(schema, prop, key)));
  } else if (type === 'array') {
    ret.push.apply(ret, _toConsumableArray(generateNegativesForArray(schema, prop, key)));
  } else if (type === 'object') {
    ret.push.apply(ret, _toConsumableArray(generateNegativesForObject(schema, prop, key)));
  }
  ret.push.apply(ret, _toConsumableArray(generateExtraConditions(schema, prop, key)));

  return ret;
}

function generateForTypes(schema) {
  var ret = [];
  var keys = schema.properties ? Object.keys(schema.properties) : [null];
  if (!keys || !keys.length) {
    return ret;
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var prop = key === null ? schema : schema.properties[key];

    ret.push.apply(ret, _toConsumableArray(generateNegativeType(schema, prop, key)));
    ret.push.apply(ret, _toConsumableArray(generateNegativeDetailsForType(schema, prop, key)));
  }

  return ret;
}

function generateFromRequired(schema) {
  var positive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var ret = [];
  if (!Array.isArray(schema.required) || !schema.required.length) {
    return ret;
  }

  var keys = Object.keys(schema.properties);
  var props = positive ? _.difference(keys, schema.required) : schema.required;

  if (!Array.isArray(props) || !props.length) {
    return ret;
  }

  props.forEach(function (prop) {
    if (typeof prop === 'string') {
      var sample = jsf(schema);
      var msg = positive ? 'should work without optional property: ' + prop : 'should not work without required property: ' + prop;

      ret.push({
        valid: positive,
        data: _.omit(sample, prop),
        message: msg,
        property: prop
      });
    }
  });

  return ret;
}

/**
 * Generates test data based on JSON schema
 * @param  {Object} schema Fully expanded (no <code>$ref</code>) JSON Schema
 * @return {Array} Array of test data objects
 */
function generate(schema) {
  var ret = [];
  if (!validate(schema)) {
    return ret;
  }

  var fullSample = jsf(schema);
  if (!fullSample) {
    return ret;
  }

  ret.push({
    valid: true,
    data: fullSample,
    message: 'should work with all required properties'
  });

  ret.push.apply(ret, _toConsumableArray(generateFromRequired(schema)));
  ret.push.apply(ret, _toConsumableArray(generateFromRequired(schema, false)));
  ret.push.apply(ret, _toConsumableArray(generateForTypes(schema)));

  return ret;
}

/**
 * Generates test data based on JSON schema
 * @param  {Object} schema Fully expanded (no <code>$ref</code>) JSON Schema
 * @return {Object} a valid test data object
 */
function generate_simple(schema) {
  var ret = {};
  if (!validate(schema)) {
    return ret;
  }

  var fullSample = jsf(schema);
  if (!fullSample) {
    return ret;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.entries(fullSample)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          key = _step$value[0],
          value = _step$value[1];

      ret[key] = JSON.stringify(fullSample[key]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return ret;
}

generate.getNegativeTypes = getNegativeTypes;
module.exports.generate = generate;
module.exports.generate_simple = generate_simple;