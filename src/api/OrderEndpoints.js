import { get, post } from './helpers/ApiRequestsHelper'

function getIndexCustomer () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function createOrder (data) {
  return post('orders', data)
}

export { getIndexCustomer, getOrderDetail, createOrder }
