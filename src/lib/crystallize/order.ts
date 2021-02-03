import orderMutation from './graph/mutations/createOrder'
import updateMutation from './graph/mutations/updateOrder'
import orderQuery from './graph/queries/orderById'
import { callOrdersApi, callPimApi } from './index'

export const createCrystallizeOrder = (variables: unknown) =>
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

export const updateCrystallizeOrder = (variables: unknown) =>
  callPimApi({
    query: updateMutation,
    variables,
    operationName: 'updateOrder',
  })
