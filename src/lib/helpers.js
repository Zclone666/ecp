export const checkDouble = (value) => {
  value = (value.replace && value.replace(',', '.')) || '0'
  let arr = value.split('.')
  if(
    value === ''
    || value === 0
    || value === '0'
    || value === '.'
    || arr[1] === ''
    || arr[1] === '0'
    || arr[1] === '00'
    || arr[1] === '000'
    || arr[1] === '0000'
    || arr[1] === '00000'
    || arr.length > 2
  ) {
    return false
  }
  return true
}

export const clearDouble = (value) => {
  // console.log(value);
  if( value === '' ) return value
  value = (value.replace && value.replace(',', '.')) || '0'
  let arr = value.split('.')
  if( arr.length > 2 ) return arr.slice(0, 2).join('.')
  if( value === '0' || value === 0 ) return '0'
  if(
    value === ''
    || value === '.'
    || arr[1] === ''
    || arr[1] === '0'
    || arr[1] === '00'
    || arr[1] === '000'
    || arr[1] === '0000'
    || arr[1] === '00000'
  ) {
    return value
  }
  return value
}
