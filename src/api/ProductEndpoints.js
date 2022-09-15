import { get } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}

function getTopProducts () {
  return get('/products/popular')
}

export { getProductCategories, getTopProducts }
