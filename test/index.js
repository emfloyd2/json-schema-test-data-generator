import test from 'ava';
const jst = require('../dist/index');
import _ from 'lodash';
const validator = require('validator');

const userSchema = require('./user.json');

test('should generate test data with differnte variations based on required property', t => {
  const required = userSchema.required;
  const data = jst.generate(userSchema);

  // should have data that has all required fields
  let found = _.some(data, d => {
    const v = d.valid;
    const keys = Object.keys(d.data);
    const diff = _.difference(required, keys);
    return v === true && diff.length === 0;
  });

  t.true(found);

  required.forEach(req => {
    // check that there is sample data that does not have the required property
    found = _.some(data, d => {
      const keys = Object.keys(d.data);
      return d.valid === false && keys.indexOf(req) === -1;
    });

    t.true(found, `test failed for property: ${req}`);
  });

  t.pass();
});

test('should generate test data with negative type tests for simple primitive data types', t => {
  const required = userSchema.required;
  const data = jst.generate(userSchema);

  required.forEach(req => {
    const found = _.chain(data)
      .filter(d => (d.valid === false) && (d.property && d.property === req) && (typeof d.data[req] !== 'undefined'))
      .some(d => {
        const types = jst.generate.getNegativeTypes(userSchema.properties[req]);
        const dataType = d.data[req] === null ? 'null' : typeof d.data[req];
        const check = types.indexOf(dataType) >= 0;
        return check;
      }).value();

    t.true(found, `test failed for property: ${req}`);
  });

  t.pass();
});

test('should create negative for number multipleOf', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'number',
        multipleOf: 2
      }
    },
    required: ['foo']
  };

  const data = jst.generate(schema);
  const required = schema.required;

  required.forEach(req => {
    const found = _.chain(data)
      .filter(d => (d.valid === false) && (d.property && d.property === req) && (typeof d.data[req] !== 'undefined'))
      .some(d => {
        const val = d.data[req];
        return val % 2 !== 0;
      }).value();

    t.true(found, `test failed for multipleOf of property: ${req}`);
  });

  t.pass();
});

test('should create negative for number maximum', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'number',
        maximum: 3
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'number')
    .some(d => d.data.foo && d.data.foo > 3)
    .value();

  t.true(found, `test failed for maximum`);

  t.pass();
});

test('should create negative for number minimum', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'number',
        minimum: 3
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'number')
    .some(d => d.data.foo && d.data.foo < 3)
    .value();

  t.true(found, `test failed for minimum`);

  t.pass();
});

test('should create negative for string maxLength', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        maxLength: 5
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'string')
    .some(d => d.data.foo && d.data.foo.length > 5)
    .value();

  t.true(found, `test failed for maxLength`);

  t.pass();
});

test('should create negative for string minLength', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        minLength: 5
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'string')
    .some(d => d.data.foo && d.data.foo.length < 5)
    .value();

  t.true(found, `test failed for minLength`);

  t.pass();
});

test('should create negative for string pattern date-time', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        format: 'date-time'
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'string')
    .some(d => d.data.foo && isNaN(Date.parse(d.data.foo)))
    .value();

  t.true(found, `test failed for validation of pattern date-time`);

  t.pass();
});

test('should create negative for string pattern email', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        format: 'email'
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'string')
    .some(d => d.data.foo && !validator.isEmail(d.data.foo))
    .value();

  t.true(found, `test failed for validation of pattern email`);

  t.pass();
});

test('should create negative for string pattern uri', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        format: 'uri'
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && typeof d.data.foo === 'string')
    .some(d => d.data.foo && !validator.isURL(d.data.foo))
    .value();

  t.true(found, `test failed for validation of pattern uri`);

  t.pass();
});

test('should create negative for array property maxItems', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'array',
        items: {
          type: 'string'
        },
        maxItems: 5
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && Array.isArray(d.data.foo))
    .some(d => d.data.foo && d.data.foo.length > 5)
    .value();

  t.true(found, `test failed for validation of maxItems`);

  t.pass();
});

test('should create negative for array property minItems', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 5
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && Array.isArray(d.data.foo))
    .some(d => d.data.foo && d.data.foo.length < 5)
    .value();

  t.true(found, `test failed for validation of minItems`);

  t.pass();
});

test('should create negative for array property uniqueItems', t => {
  const schema = {
    type: 'object',
    properties: {
      foo: {
        type: 'array',
        items: {
          type: 'string'
        },
        uniqueItems: true
      }
    }
  };

  const data = jst.generate(schema);
  const found = _.chain(data)
    .filter(d => d.valid === false && Array.isArray(d.data.foo))
    .some(d => d.data.foo && _.uniq(d.data.foo).length < d.data.foo.length)
    .value();

  t.true(found, `test failed for validation of uniqueItems`);

  t.pass();
});

test('should create negative simple type schema', t => {
  const schema = {
    type: 'string'
  };

  const data = jst.generate(schema);

  const found = _.chain(data)
    .filter(d => d.valid === false)
    .some(d => typeof d.data !== 'string')
    .value();

  t.true(found);

  t.pass();
});

test('should create negative simple type schema and additional properties', t => {
  const schema = {
    type: 'number',
    minimum: 5
  };

  const data = jst.generate(schema);

  const found = _.chain(data)
    .filter(d => d.valid === false)
    .some(d => typeof d.data === 'number' && d.data < 5)
    .value();

  t.true(found);

  t.pass();
});

test('should create negative test data for schema with array', t => {
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      foos: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 5
        }
      }
    },
    required: ['name', 'foos']
  };

  const data = jst.generate(schema);

  const found = _.chain(data)
    .filter(d => d.valid === false && d.data && Array.isArray(d.data.foos))
    .some(d => d.message.indexOf('within array test' >= 0))
    .value();

  t.true(found);

  t.pass();
});

test('should create negative test data for schema with array and minItems property', t => {
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      foos: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 5
        },
        minItems: 3
      }
    },
    required: ['name', 'foos']
  };

  const data = jst.generate(schema);

  const found = _.chain(data)
    .filter(d => d.valid === false && d.data && Array.isArray(d.data.foos))
    .some(d => d.message.indexOf('within array test' >= 0) && d.data.foos.length < 3)
    .value();

  t.true(found);

  t.pass();
});

test('should create negative test data for nested object property', t => {
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      foo: {
        type: 'object',
        properties: {
          bar: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    required: ['name', 'foo']
  };

  const data = jst.generate(schema);

  const found = _.chain(data)
    .filter(d => d.valid === false && d.data && d.data.foo && typeof d.data.foo.bar !== 'undefined')
    .filter(d => d.message.indexOf('nested object test' >= 0) && (typeof d.data.foo.bar !== 'string' || d.data.foo.bar.length < 5))
    .value();

  t.is(found.length, 2);

  t.pass();
});

test('generate_simple: should generate a single test data object all required fields', t => {
  const required = userSchema.required;
  const data = jst.generate_simple(userSchema);

  // should have data that has all required fields
  const keys = Object.keys(data);
  const diff = _.difference(required, keys);
  t.true(diff.length === 0);
});
