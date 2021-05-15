import orderMutation from './graph/mutations/createOrder'
import updateMutation from './graph/mutations/updateOrder'
import allOrdersQuery from './graph/queries/allOrders'
import orderQuery from './graph/queries/orderById'
import { callOrdersApi, callPimApi } from './index'
import { CreateOrderInput } from './types-orders'

export const createCrystallizeOrder = (variables: CreateOrderInput) =>
  callOrdersApi({
    query: orderMutation,
    variables,
    operationName: 'createOrder',
  })

export const fetchCrystallizeOrder = (orderId: string) =>
  callOrdersApi({
    query: orderQuery,
    variables: { id: orderId },
    operationName: 'getOrder',
  })

export const fetchCrystallizeAllOrders = () =>
  callOrdersApi({
    query: allOrdersQuery,
    variables: {},
    operationName: 'getAllOrders',
  })

export const updateCrystallizeOrder = (variables: CreateOrderInput) =>
  callPimApi({
    query: updateMutation,
    variables,
    operationName: 'updateOrder',
  })
