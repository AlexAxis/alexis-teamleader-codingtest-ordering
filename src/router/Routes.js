import React, { useState } from 'react'
import { BrowserRouter, Switch, Route, Redirect, Link } from 'react-router-dom'

import {
  AppBar,
  Toolbar,
  Button,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from '@material-ui/core'
import { AccountCircle } from '@material-ui/icons'

import { useRecoilState, useRecoilValue } from 'recoil'
import { loggedCustomer, customers } from '../config/recoil/Atoms'
import ProductList from '../pages/ProductList'
import OrderList from '../pages/OrderList'

export default function Routes() {
  const [atomLoggedCustomer, setAtomLoggedCustomer] = useRecoilState(
    loggedCustomer
  )
  const atomCustomers = useRecoilValue(customers)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChangeLogin = (val) => {
    setAtomLoggedCustomer(val)
    handleClose()
  }

  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <List>
            <ListItem button component={Link} to="/OrderList">
              <ListItemText primary="Order List" />
            </ListItem>
          </List>
          <List>
            <ListItem button component={Link} to="/ProductList">
              <ListItemText primary="Product List" />
            </ListItem>
          </List>
          <AccountCircle style={{ marginLeft: 'auto' }} />
          <Button
            color="inherit"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            Logged-in as: &nbsp;
            <Typography variant="h5" component="h2">
              {atomCustomers.map((item) => {
                if (item.id === atomLoggedCustomer) {
                  return item.name
                }
                return null
              })}
            </Typography>
          </Button>

          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {atomCustomers.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleChangeLogin(item.id)}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Switch>
        <Route path="/OrderList">
          <OrderList />
        </Route>

        <Route path="/ProductList">
          <ProductList />
        </Route>

        <Redirect to="/OrderList" />
      </Switch>
    </BrowserRouter>
  )
}
