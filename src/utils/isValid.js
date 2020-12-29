/**
 * @param {any} value it will be checked value for is validation
 * @param {string | Object} type JavaScript Primitive Type
 */
function isValidProp(value, type)  {
  if (type !== null && type !== undefined && value !== null && value !== undefined) {
    if (typeof type === 'string') {
      if (typeof value === type) {
        return true;
      }
    }

    if(typeof type === 'function' || typeof type === 'object')  {
      if (value instanceof type) {
        return true;
      }
    }
  }

  return false;
}

const isValid = {
  /** @param {string} value */
  string: (value) => isValidProp(value, 'string'),
  
  /** @param {number} value */
  number: (value) => isValidProp(value, 'number'),
  
  /** @param {boolean} value */
  boolean: (value) => isValidProp(value, 'boolean'),
  
  /** @param {any} value */
  object: (value) => isValidProp(value, 'object'),
  
  /** @param {function} value */
  function: (value) => isValidProp(value, 'function'),
  
  /** @param {any[]} value */
  array: (value) => isValidProp(value, Array),
  
  /** @param {symbol} value */
  symbol: (value) => isValidProp(value, 'symbol'),
}

export {
  isValid,
  isValidProp
}
