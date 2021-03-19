import React, { useEffect, useState } from 'react'
import ReactTable from 'react-table-6'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Button, Typography, Icon, Modal, TextField } from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import { ToastContainer, toast } from 'react-toastify'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import { loggedCustomer, orders, customers } from '../config/recoil/Atoms'

// Styles of the Modal
const useStyles = makeStyles((theme) => ({
  modal: {
    position: 'absolute',
    width: 1000,
    height: 700,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}))

// Styles of the green button (Purchase)
const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  }
}))(Button)

export default function OrderList() {
  const classes = useStyles()

  const atomLoggedCustomer = useRecoilValue(loggedCustomer)
  const [atomOrders, setAtomOrders] = useRecoilState(orders)
  const [atomCustomers, setAtomCustomers] = useRecoilState(customers)

  const [expandedRows, setExpandedRows] = useState([])
  const [selectedOrder, setSelectedOrder] = useState([])
  const [editedOrder, setEditedOrder] = useState([])
  const [open, setOpen] = useState(false)

  // Handles the appearance of the modal (open modal and set information that will be filled inside the table of the modal)
  const handleOpen = (id, position) => {
    let currentOrder = []
    currentOrder = atomOrders[atomLoggedCustomer][position].items
    setEditedOrder(currentOrder)
    const selectedOrderIdAndPosition = []
    // ? In the first element it will save the id of the order, and in the second element it will save in which position of the array of orders of the logged-in customer this order is
    selectedOrderIdAndPosition.push(id, position)
    setSelectedOrder(selectedOrderIdAndPosition)
    setOpen(true)
  }

  // Handles the variable that saves the current value of the quantities inserted in the edited order of the modal
  const handleChange = (event, index, price) => {
    const currentValue = JSON.parse(JSON.stringify(editedOrder))
    currentValue[index].quantity = event.target.value.replace(/[^0-9]/g, '')
    currentValue[index].unitPrice = price
    currentValue[index].total = (
      Number(price) * Number(currentValue[index].quantity)
    )
      .toFixed(2)
      .toString()
    setEditedOrder(currentValue)
  }

  // Handles the closing of the modal (clears the auxiliar variable that handles the state of the quantities inserted)
  const handleClose = () => {
    setSelectedOrder([])
    setOpen(false)
  }

  // Expands the table to appear its SubComponents
  useEffect(() => {
    let newLogginOrders = atomOrders[atomLoggedCustomer]
    async function resetTable() {
      await setExpandedRows(newLogginOrders.map(() => false))
      await setExpandedRows(newLogginOrders.map(() => true))
    }
    if (newLogginOrders) {
      newLogginOrders = newLogginOrders.map(() => true)
      resetTable()
    }
  }, [atomOrders, atomLoggedCustomer])

  // Indicates the revenue of the logged-in customer
  const customerRevenue = () => {
    let aux = ''
    atomCustomers.forEach((item) => {
      if (item.id === atomLoggedCustomer) {
        aux = item.revenue
      }
    })
    return aux
  }
  const revenue = customerRevenue()

  // Indicates the id of the order that was selectedfor the buttons DELETE and PURCHASE
  const getOrderId = (index) => {
    let orderId = ''
    atomOrders[atomLoggedCustomer].forEach((item, i) => {
      if (i === index) {
        orderId = item.id
      }
    })
    return orderId
  }

  // Updates the quantities of the selected order (both locally and to the server)
  async function validate() {
    // *** Fetch -> PUT order
    await fetch(
      `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/orders/${selectedOrder[0]}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          items: atomOrders[atomLoggedCustomer][selectedOrder[1]].items
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      }
    )
      .then((response) => response.json())
      .then(() => {
        let total = 0
        editedOrder.forEach((item) => {
          total += Number(item.total)
        })
        total = total.toFixed(2).toString()

        const currentOrder = JSON.parse(JSON.stringify(atomOrders))
        currentOrder[atomLoggedCustomer][selectedOrder[1]].total = total
        currentOrder[atomLoggedCustomer][selectedOrder[1]].items = editedOrder
        setAtomOrders(currentOrder)
        toast.success('Order updated')
      })
      .catch((err) => {
        toast.error(err)
      })

    handleClose()
  }

  // Deletes the order (both locally and to the server)
  async function deleteOrder(index) {
    const id = getOrderId(index)

    // *** Fetch -> DELETE order
    await fetch(
      `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/orders/${id}`,
      {
        method: 'DELETE'
      }
    )
      .then((response) => response.json())
      .then(() => {
        const currentOrder = JSON.parse(JSON.stringify(atomOrders))
        currentOrder[atomLoggedCustomer].splice(index, 1)
        setAtomOrders(currentOrder)
        toast.success('Order deleted')
      })
      .catch((err) => {
        toast.error(err)
      })
  }

  // Deletes the order and subtracts the revenue (both locally and to the server)
  async function purchaseOrder(index) {
    if (Number(revenue) > Number(atomOrders[atomLoggedCustomer][index].total)) {
      const id = getOrderId(index)

      // *** Fetch -> DELETE order
      await fetch(
        `http://my-json-server.typicode.com/AlexAxis/alexis-teamleader-codingtest-ordering/orders/${id}`,
        {
          method: 'DELETE'
        }
      )
        .then((response) => response.json())
        .then(() => {
          const currentOrder = JSON.parse(JSON.stringify(atomOrders))
          const currentCustomer = JSON.parse(JSON.stringify(atomCustomers))
          atomCustomers.forEach((item, i) => {
            if (item.id === atomLoggedCustomer) {
              currentCustomer[i].revenue = (
                Number(item.revenue) -
                Number(currentOrder[atomLoggedCustomer][index].total)
              )
                .toFixed(2)
                .toString()
            }
          })
          currentOrder[atomLoggedCustomer].splice(index, 1)
          setAtomCustomers(currentCustomer)
          setAtomOrders(currentOrder)
          toast.success('Order successfully purchased')
        })
        .catch((err) => {
          toast.error(err)
        })
    } else {
      toast.error('Insufficient revenue')
    }
  }

  // Structure of the table by columns (headers and rows) of the modal
  const orderItemsModal = [
    {
      Header: 'product-id',
      accessor: 'product-id'
    },
    {
      Header: 'quantity',
      accessor: 'quantity',
      Cell: (row) => (
        <TextField
          id="outlined-basic"
          defaultValue="0"
          placeholder="0"
          variant="outlined"
          type="number"
          InputProps={{ inputProps: { min: 1 } }}
          value={editedOrder[row.index].quantity}
          onChange={(event) =>
            handleChange(event, row.index, row.row['unit-price'])
          }
        />
      )
    },
    {
      Header: 'unit-price',
      accessor: 'unit-price'
    },
    {
      Header: 'total item',
      accessor: 'total'
    }
  ]

  // Structure of the table by columns (headers and rows)
  const orderColumns = [
    {
      Header: 'Total Order',
      accessor: 'total',
      sortable: false
    },
    {
      Header: '',
      sortable: false,
      Cell: (row) => (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {/* // ? This code is not supposed to be here. Its only purpose is to show that the 'id' is being generated */}
          <div style={{ opacity: '0' }}> ID: {row.original.id}</div>
        </>
      )
    },
    {
      sortable: false,
      Cell: (row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            color="secondary"
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={() => deleteOrder(row.index)}
          >
            DELETE
          </Button>
          <Button
            color="primary"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => handleOpen(row.original.id, row.index)}
          >
            EDIT
          </Button>
          <ColorButton
            color="secondary"
            variant="contained"
            endIcon={<Icon>send</Icon>}
            onClick={() => purchaseOrder(row.index)}
          >
            PURCHASE
          </ColorButton>
        </div>
      )
    }
  ]

  // Structure of the table by columns (headers and rows) of the SubComponent
  const orderItems = [
    {
      Header: 'product-id',
      accessor: 'product-id'
    },
    {
      Header: 'quantity',
      accessor: 'quantity'
    },
    {
      Header: 'unit-price',
      accessor: 'unit-price'
    },
    {
      Header: 'total item',
      accessor: 'total'
    }
  ]

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        Revenue:&nbsp;
        <Typography variant="h5" component="h2">
          {revenue}
        </Typography>
      </div>
      <ReactTable
        // filterable
        style={{ margin: '20px' }}
        data={atomOrders[atomLoggedCustomer]}
        defaultPageSize={10}
        columns={orderColumns}
        expanded={expandedRows}
        onExpandedChange={(newExpanded) => setExpandedRows(newExpanded)}
        className="-striped -highlight"
        SubComponent={(row) => (
          <>
            <ReactTable
              style={{
                marginLeft: '100px',
                marginTop: '20px',
                marginBottom: '20px',
                marginRight: '340px'
              }}
              defaultPageSize={
                atomOrders[atomLoggedCustomer][row.index].items.length
              }
              showPagination={false}
              data={atomOrders[atomLoggedCustomer][row.index].items}
              columns={orderItems}
              className="-striped -highlight"
            />
          </>
        )}
      />
      <ToastContainer position="top-center" />
      {selectedOrder.length > 0 && (
        <Modal open={open} onClose={handleClose}>
          <div
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            className={classes.modal}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Edit Order</h2>{' '}
              <Button
                color="primary"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={validate}
              >
                VALIDATE
              </Button>
            </div>
            <p>Type the new quantities of products you want to order</p>
            <ReactTable
              style={{
                marginLeft: '100px',
                marginTop: '20px',
                marginBottom: '20px',
                marginRight: '20px'
              }}
              data={editedOrder}
              defaultPageSize={
                atomOrders[atomLoggedCustomer][selectedOrder[1]].items.length <
                6
                  ? atomOrders[atomLoggedCustomer][selectedOrder[1]].items
                      .length
                  : 5
              }
              showPagination={
                !(
                  atomOrders[atomLoggedCustomer][selectedOrder[1]].items
                    .length < 6
                )
              }
              pageSizeOptions={[5]}
              columns={orderItemsModal}
              className="-striped -highlight"
            />
          </div>
        </Modal>
      )}
    </>
  )
}
