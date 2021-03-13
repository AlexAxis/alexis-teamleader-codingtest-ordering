import React from 'react'
import { BrowserRouter, Switch, Route, Redirect, Link } from 'react-router-dom'
// Pages
import OrderDetail from '../pages/OrderDetail'
import OrderList from '../pages/OrderList'
import ProductList from '../pages/ProductList'

export default function Routes() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/OrderList">OrderList</Link>
            </li>
            <li>
              <Link to="/ProductList">ProductList</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/OrderList">
            <OrderList />
          </Route>
          <Route path="/ProductList">
            <ProductList />
          </Route>
          <Route path="/OrderDetail/:id">
            <OrderDetail />
          </Route>
          <Redirect to="/OrderList" />
        </Switch>
      </div>
    </BrowserRouter>
  )
}
