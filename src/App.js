import React, { useEffect } from 'react'
import './App.css'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'
import Routes from './router/Routes'
import {
  customers,
  products,
  orders,
  loggedCustomer
} from './config/recoil/Atoms'

function App() {
  const setAtomCustomers = useSetRecoilState(customers)
  const setAtomProducts = useSetRecoilState(products)
  const [atomOrders, setAtomOrders] = useRecoilState(orders)
  const atomLoggedCustomer = useRecoilValue(loggedCustomer)

  // *** Fetch -> GET customers
  useEffect(() => {
    fetch(
      `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/customers`
    )
      .then((response) => response.json())
      .then((json) => {
        setAtomCustomers(json)
      })
  }, [])

  // *** Fetch -> GET products
  useEffect(() => {
    fetch(
      `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/products`
    )
      .then((response) => response.json())
      .then((json) => {
        setAtomProducts(json)
      })
  }, [])

  // *** Fetch -> GET orders (from the logged-in customer)
  useEffect(() => {
    fetch(
      `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/orders?customer-id=${atomLoggedCustomer}`
    )
      .then((response) => response.json())
      .then((json) => {
        // This condition wouldn't be here if the application was using a real server instead of "jsonplaceholder"
        if (!atomOrders[atomLoggedCustomer]) {
          const newLogginOrders = JSON.parse(JSON.stringify(atomOrders))
          newLogginOrders[atomLoggedCustomer] = json
          setAtomOrders(newLogginOrders)
        }
      })
  }, [atomLoggedCustomer])
  return <Routes />
}

export default App
