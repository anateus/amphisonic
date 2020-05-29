const partial = (fn, firstArg) => {  return (...lastArgs) => {    return fn(firstArg, ...lastArgs);  }}

export default partial