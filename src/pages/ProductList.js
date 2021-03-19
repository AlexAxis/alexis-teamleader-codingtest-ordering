import React, { useState, useEffect } from 'react'
import ReactTable from 'react-table-6'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Button, TextField } from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import { products, orders, loggedCustomer } from '../config/recoil/Atoms'

export default function ProductList() {
  const atomLoggedCustomer = useRecoilValue(loggedCustomer)
  const [atomOrders, setAtomOrders] = useRecoilState(orders)
  const atomProducts = useRecoilValue(products)
  const [newOrder, setNewOrder] = useState({})

  // Clears the quantities inserted in the inputs of the table
  const resetOrder = () => {
    const emptyOrder = {}
    atomProducts.forEach((item) => {
      emptyOrder[item.id] = {}
      emptyOrder[item.id].quantity = '0'
      emptyOrder[item.id].unitPrice = '0'
      emptyOrder[item.id].total = '0'
    })
    setNewOrder(emptyOrder)
  }
  useEffect(() => {
    if (atomProducts.length > 0) {
      resetOrder()
    }
  }, [atomProducts])

  // Handles the variable that saves the current value of the quantities inserted in the new order
  const handleChange = (event, id, price) => {
    const currentValue = JSON.parse(JSON.stringify(newOrder))
    currentValue[id].quantity = event.target.value.replace(/[^0-9]/g, '')
    currentValue[id].unitPrice = price
    currentValue[id].total = (
      Number(price) * Number(currentValue[id].quantity)
    ).toString()
    setNewOrder(currentValue)
  }

  // Creates the new order (both locally and to the server)
  async function createOrder() {
    const itemsForNewOrder = []
    let totalOrder = 0
    Object.entries(newOrder).forEach(([key, value]) => {
      if (Number(value.quantity) > 0) {
        itemsForNewOrder.push({
          'product-id': key,
          quantity: value.quantity,
          'unit-price': value.unitPrice,
          total: value.total
        })
        totalOrder += Number(value.total)
      }
    })
    if (itemsForNewOrder.length > 0) {
      const createNewOrder = {
        'customer-id': atomLoggedCustomer,
        items: itemsForNewOrder,
        total: totalOrder.toFixed(2).toString()
      }
      let responseFromFetch = null

      // *** Fetch -> POST order (new order of the logged-in customer)
      // and receives the id of that order so we can fill it locally as well
      await fetch(
        'http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/orders',
        {
          method: 'POST',
          body: JSON.stringify(createNewOrder),
          headers: {
            'Content-type': 'application/json; charset=UTF-8'
          }
        }
      )
        .then((response) => response.json())
        .then((json) => {
          responseFromFetch = json
        })
        .catch((err) => {
          toast.error(err)
        })

      const currentCustomerOrders = JSON.parse(JSON.stringify(atomOrders))
      currentCustomerOrders[atomLoggedCustomer].push(responseFromFetch)
      setAtomOrders(currentCustomerOrders)
      resetOrder()
      toast.success('Order created successfully')
      toast.info(`Check the 'Order List' page`)
    } else {
      toast.warning('WARNING: Empty quantities of products')
    }
  }

  // Structure of the table by columns (headers and rows)
  const productsColumns = [
    {
      Header: 'id',
      accessor: 'id'
    },
    {
      Header: 'description',
      accessor: 'description'
    },
    {
      Header: 'category',
      accessor: 'category'
    },
    {
      Header: 'price',
      accessor: 'price',
      filterable: false
    },
    {
      Header: () => (
        <Button color="secondary" variant="contained" onClick={createOrder}>
          CREATE NEW ORDER
        </Button>
      ),
      Cell: (row) => (
        <div>
          {Object.keys(newOrder).length > 0 ? (
            <TextField
              id="outlined-basic"
              defaultValue="0"
              placeholder="0"
              variant="outlined"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={newOrder[row.row.id].quantity}
              onChange={(event) =>
                handleChange(event, row.row.id, row.row.price)
              }
            />
          ) : null}
        </div>
      ),
      filterable: false,
      sortable: false
    }
  ]
  return (
    <>
      <ReactTable
        style={{ margin: '20px' }}
        filterable
        data={atomProducts}
        defaultPageSize={10}
        columns={productsColumns}
        className="-striped -highlight"
      />
      <ToastContainer position="top-center" />
    </>
  )
}
