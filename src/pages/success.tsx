import { useRouter } from 'next/dist/client/router'
import { Fragment, useEffect, useState } from 'react'

import IfElse from '~components/IfElse'
import PageContent from '~components/PageContent'
import ShowcaseCard from '~components/ShowcaseCard'
import { getLayout } from '~layouts/CatalogueLayout'
import { trpc } from '~lib/trpc'
import useCart from '~stores/useCart'
import { Option } from '~typings/utils'

function SuccessPage() {
  const router = useRouter()
  const cart = useCart((state) => state.items)
  const clearItems = useCart((state) => state.clearItems)
  const [orderID, setOrderID] = useState<Option<string>>(null)
  const { mutate: orderByPaymentID } = trpc.useMutation(
    'crystallize.order-by-payment-id',
  )
  const {
    data: order,
    refetch,
    isFetched,
  } = trpc.useQuery(['crystallize.get-order', { id: orderID ?? '' }], {
    enabled: !!orderID,
  })
  const { data: productsData } = trpc.useQuery(['crystallize.get-all-products'])
  const products = productsData?.products
  const { mutate: getPaymentIntent } = trpc.useMutation(
    'stripe.payment-intents',
  )
  const { mutate: createOrder } = trpc.useMutation('crystallize.create-order')
  const [customer, setCustomer] = useState<Option<string>>(null)
  const [quantity, setQuantity] = useState<Option<number>>(null)
  const [receipt, setReciept] = useState<Option<string>>(null)

  trpc.useQuery(
    [
      'stripe.checkout-session',
      { sessionId: router.query?.session_id as string | undefined },
    ],
    {
      enabled: !!router.query?.session_id,
      onSuccess: (stripeData) => {
        if (stripeData) {
          getPaymentIntent(
            {
              paymentIntentId: String(stripeData.payment_intent),
            },
            {
              onSuccess: (paymentIntent) => {
                const charge = paymentIntent?.data?.[0]
                if (charge) {
                  setCustomer(charge.shipping?.name)
                  setQuantity((charge.amount ?? 100) / 100)
                  setReciept(charge.receipt_url)
                  orderByPaymentID(
                    {
                      paymentIntentId: String(stripeData.payment_intent),
                    },
                    {
                      onSuccess: (ordr) => {
                        if (ordr?.node.id) {
                          setOrderID(ordr.node.id)
                        } else {
                          createOrder(
                            {
                              cart,
                              charge,
                            },
                            {
                              onSuccess: (order) => {
                                if (order) {
                                  setOrderID(order.id)
                                }
                              },
                            },
                          )
                        }
                        clearItems()
                      },
                      onError: console.error,
                    },
                  )
                }
              },
              onError: console.error,
            },
          )
        }
      },
      onError: console.error,
    },
  )

  useEffect(() => {
    if (orderID && isFetched && !order) {
      const timeout = setTimeout(refetch, 5000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [orderID, order, isFetched, refetch])

  return (
    <section className="w-full min-h-full p-8 mx-auto space-y-6 text-sm bg-color-100 dark:bg-color-800 max-w-prose">
      <h2 className="font-bold">
        <IfElse predicate={customer}>{(cst) => <>{`${cst}! `}</>}</IfElse>
      </h2>
      <PageContent path="/success" />
      <IfElse
        predicate={order?.cart.length && products?.length ? order.cart : null}
      >
        {(items) => (
          <Fragment>
            <div className="pb-1 text-xs font-semibold border-b border-color-500">
              {'Your purchase'}
            </div>
            <div className="w-full space-y-4 text-center">
              {items.map((item) => (
                <div key={item.sku}>
                  <ShowcaseCard
                    item={products?.find((prod) =>
                      prod.variants?.find((v) => v.sku === item.sku),
                    )}
                  />
                  <div className="font-semibold">
                    ${item?.price?.gross ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        )}
      </IfElse>
      <IfElse
        predicate={
          (quantity ?? 0) -
          (order?.cart?.reduce((r, c) => r + (c?.price?.gross ?? 0), 0) ?? 0)
        }
      >
        {(shp) => (
          <div className="space-y-2">
            <div className="pb-1 text-xs font-semibold border-b border-color-500">
              {'Shipping'}
            </div>
            <div className="text-sm">{shp.toFixed(2)} USD</div>
          </div>
        )}
      </IfElse>
      <IfElse predicate={quantity}>
        {(qnt) => (
          <div className="space-y-2">
            <div className="pb-1 text-xs font-semibold border-b border-color-500">
              {'Total'}
            </div>
            <div className="text-sm">{qnt} USD</div>
          </div>
        )}
      </IfElse>
      <IfElse predicate={receipt} placeholder={<>loading...</>}>
        {(rsp) => (
          <div className="space-y-2">
            <div className="pb-1 text-xs font-semibold border-b border-color-500">
              {'Receipt'}
            </div>
            <a
              className="block text-sm"
              href={rsp}
              target="_blank"
              rel="noreferrer"
            >
              [GET RECEIPT]
            </a>
          </div>
        )}
      </IfElse>
    </section>
  )
}

SuccessPage.getLayout = getLayout

export default SuccessPage
