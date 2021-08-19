import { NextSeo } from 'next-seo'
import getConfig from 'next/config'
import { useRouter } from 'next/dist/client/router'
import { Fragment, useEffect, useState } from 'react'
import IfElse from '~components/IfElse'
import PageContent from '~components/PageContent'
import ShowcaseCard from '~components/ShowcaseCard'
import { getLayout } from '~layouts/CatalogueLayout'
import { trpc } from '~lib/trpc'
import useCart from '~stores/useCart'
import { Option } from '~typings/utils'

const { publicRuntimeConfig } = getConfig()

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
    <>
      <NextSeo
        title="Success"
        openGraph={{
          type: 'website',
          url: `${publicRuntimeConfig.SITE_URL}/success`,
          title: 'Success',
        }}
      />
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
              <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
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
              <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
                {'Shipping'}
              </div>
              <div className="text-sm">{shp.toFixed(2)} USD</div>
            </div>
          )}
        </IfElse>
        <IfElse predicate={quantity}>
          {(qnt) => (
            <div className="space-y-2">
              <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
                {'Total'}
              </div>
              <div className="text-sm">{qnt}.00 USD</div>
            </div>
          )}
        </IfElse>
        <IfElse predicate={receipt} placeholder={<>loading...</>}>
          {(rsp) => (
            <div className="space-y-2">
              <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
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
    </>
  )
}

SuccessPage.getLayout = getLayout

export default SuccessPage

// import { useRouter } from 'next/dist/client/router'
// import { Fragment, useEffect, useState } from 'react'
// import Stripe from 'stripe'
// import IfElse from '~components/IfElse'
// import PageContent from '~components/PageContent'
// import ShowcaseCard from '~components/ShowcaseCard'
// import { getLayout } from '~layouts/CatalogueLayout'
// import { trpc } from '~lib/trpc'
// import useCart from '~stores/useCart'
// import { Option } from '~typings/utils'

// function SuccessPage() {
//   const router = useRouter()
//   const cart = useCart((state) => state.items)
//   const clearItems = useCart((state) => state.clearItems)
//   const [orderID, setOrderID] = useState<Option<string>>(null)
//   const { mutate: orderByPaymentID } = trpc.useMutation(
//     'crystallize.order-by-payment-id',
//   )
//   const {
//     data: order,
//     refetch,
//     isFetched,
//   } = trpc.useQuery(['crystallize.get-order', { id: orderID ?? '' }], {
//     enabled: Boolean(orderID),
//   })
//   const { data: productsData } = trpc.useQuery(['crystallize.get-all-products'])
//   const products = productsData?.products
//   const { mutate: getPaymentIntent } = trpc.useMutation(
//     'stripe.payment-intents',
//   )
//   const { mutate: createTransaction } = trpc.useMutation(
//     'shippo.createTransactionByRate',
//   )
//   const { mutate: createOrder } = trpc.useMutation('crystallize.create-order')
//   const [charge, setCharge] = useState<Option<Stripe.Charge>>(null)
//   const { data: rate } = trpc.useQuery(
//     ['shippo.getRate', charge?.shipping?.tracking_number || ''],
//     {
//       enabled: Boolean(charge?.shipping?.tracking_number),
//     },
//   )
//   const { data: transaction } = trpc.useQuery(
//     ['shippo.getTransaction', order?.additionalInformation || ''],
//     {
//       enabled: Boolean(order?.additionalInformation),
//     },
//   )
//   const quantity = (charge?.amount ?? 0) / 100
//   const receipt = charge?.receipt_url

//   trpc.useQuery(
//     [
//       'stripe.checkout-session',
//       { sessionId: router.query?.session_id as string | undefined },
//     ],
//     {
//       enabled: Boolean(router.query?.session_id),
//       onSuccess: (stripeData) => {
//         if (stripeData) {
//           getPaymentIntent(
//             {
//               paymentIntentId: String(stripeData.payment_intent),
//             },
//             {
//               onSuccess: (paymentIntent) => {
//                 const charge = paymentIntent?.data?.[0]
//                 if (charge) {
//                   setCharge(charge)
//                   orderByPaymentID(
//                     {
//                       paymentIntentId: String(stripeData.payment_intent),
//                     },
//                     {
//                       onSuccess: (ordr) => {
//                         if (ordr?.node.id) {
//                           setOrderID(ordr.node.id)
//                           clearItems()
//                         }
//                       },
//                       onError: console.error,
//                     },
//                   )
//                 }
//               },
//               onError: console.error,
//             },
//           )
//         }
//       },
//       onError: console.error,
//     },
//   )

//   useEffect(() => {
//     if (!orderID && charge && charge.shipping?.tracking_number) {
//       createTransaction(charge.shipping.tracking_number, {
//         onSuccess: (trnscn) => {
//           createOrder(
//             {
//               cart,
//               charge,
//               additionalInformation: trnscn?.object_id,
//               meta: [
//                 {
//                   key: 'transaction_id',
//                   value: trnscn?.object_id || '',
//                 },
//               ],
//             },
//             {
//               onSuccess: (order) => {
//                 if (order) {
//                   setOrderID(order.id)
//                   clearItems()
//                 }
//               },
//               onError: console.error,
//             },
//           )
//         },
//         onError: console.error,
//       })
//     }
//   }, [charge, orderID, cart, clearItems, createOrder, createTransaction])

//   useEffect(() => {
//     if (orderID && isFetched && !order) {
//       const timeout = setTimeout(refetch, 5000)
//       return () => {
//         clearTimeout(timeout)
//       }
//     }
//   }, [orderID, order, isFetched, refetch])

//   return (
//     <section className="w-full min-h-full p-8 mx-auto space-y-6 text-sm bg-color-100 dark:bg-color-800 max-w-prose">
//       <h2 className="font-bold">
//         <IfElse predicate={charge?.shipping}>
//           {(cst) => <>{`${cst.name}! `}</>}
//         </IfElse>
//       </h2>
//       <PageContent path="/success" />
//       <IfElse
//         predicate={order?.cart.length && products?.length ? order.cart : null}
//       >
//         {(items) => (
//           <Fragment>
//             <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
//               {'Your purchase'}
//             </div>
//             <div className="w-full space-y-4 text-center">
//               {items.map((item) => (
//                 <div key={item.sku}>
//                   <ShowcaseCard
//                     item={products?.find((prod) =>
//                       prod.variants?.find((v) => v.sku === item.sku),
//                     )}
//                   />
//                   <div className="font-semibold">
//                     ${item?.price?.gross ?? 0}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Fragment>
//         )}
//       </IfElse>
//       <IfElse predicate={charge?.shipping}>
//         {(shipping) => (
//           <div className="space-y-2 text-sm">
//             <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
//               {'Shipping'}
//             </div>
//             <div>
//               Will be delivered to{' '}
//               <strong>
//                 {shipping.address?.line1}, {shipping.address?.city},{' '}
//                 {shipping.address?.state}, {shipping.address?.country},{' '}
//                 {shipping.address?.postal_code}
//               </strong>
//             </div>
//             <div>Amount: ${rate?.amount ?? 0}</div>
//             <IfElse
//               predicate={
//                 transaction?.messages && transaction.messages.length > 0
//                   ? transaction.messages
//                   : null
//               }
//             >
//               {(msgs) => (
//                 <>
//                   {msgs.map((msg) => (
//                     <div
//                       key={msg.text}
//                       className={`text-xs ${
//                         msg.text.toLowerCase().includes('hard')
//                           ? 'text-red-600'
//                           : 'text-orange-600'
//                       }`}
//                     >
//                       {msg.source ? <strong>{msg.source || ''} </strong> : null}
//                       {msg.text}
//                     </div>
//                   ))}
//                 </>
//               )}
//             </IfElse>
//             <IfElse predicate={transaction?.tracking_number}>
//               {(trn) => (
//                 <div>
//                   Tracking number <strong>{trn}</strong>
//                 </div>
//               )}
//             </IfElse>
//             <IfElse predicate={transaction?.tracking_url_provider}>
//               {(url) => (
//                 <div>
//                   <a
//                     className="block text-sm"
//                     href={url}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     [TRACKING PAGE]
//                   </a>
//                 </div>
//               )}
//             </IfElse>
//             <IfElse predicate={transaction?.label_url}>
//               {(url) => (
//                 <div>
//                   <a
//                     className="block text-sm"
//                     href={url}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     [GET LABEL]
//                   </a>
//                 </div>
//               )}
//             </IfElse>
//           </div>
//         )}
//       </IfElse>
//       <IfElse predicate={quantity}>
//         {(qnt) => (
//           <div className="space-y-2">
//             <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
//               {'Total'}
//             </div>
//             <div className="text-sm">{qnt} USD</div>
//           </div>
//         )}
//       </IfElse>
//       <IfElse predicate={receipt} placeholder={<>loading...</>}>
//         {(rsp) => (
//           <div className="space-y-2">
//             <div className="pb-1 text-xs font-semibold border-b border-red-500/50">
//               {'Receipt'}
//             </div>
//             <a
//               className="block text-sm"
//               href={rsp}
//               target="_blank"
//               rel="noreferrer"
//             >
//               [GET RECEIPT]
//             </a>
//           </div>
//         )}
//       </IfElse>
//     </section>
//   )
// }

// SuccessPage.getLayout = getLayout

// export default SuccessPage
