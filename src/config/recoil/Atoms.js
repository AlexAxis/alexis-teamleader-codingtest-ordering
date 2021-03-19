import { atom } from 'recoil'

// This are the information that we want to use throughout the application
// Simply put, this is the store of the state manager -> Recoil
export const loggedCustomer = atom({
  key: 'loggedCustomer', // unique ID (with respect to other atoms/selectors)
  default: '1' // default value (aka initial value)
})
export const customers = atom({
  key: 'customers',
  default: []
})
export const products = atom({
  key: 'products',
  default: []
})
export const orders = atom({
  key: 'orders',
  default: {}
})
