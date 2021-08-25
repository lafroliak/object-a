import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { trpc } from '~lib/trpc'
import IfElse from './IfElse'
import PageContent from './PageContent'

type Props = {
  onClose: () => void
}

function Subscribe({ onClose }: Props) {
  const { mutate } = trpc.useMutation('mailchimp.subscribe')
  const [message, setMessage] = useState('')

  const schema = z.object({
    email: z.string().email(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit((data) => {
    if (Object.keys(errors).length !== 0) return

    mutate(data.email, {
      onSuccess: () => {
        setMessage('Success! You are now subscribed to the newsletter')
      },
      onError: (err) => {
        if (
          typeof err.message === 'string' &&
          err.message.toLowerCase().includes('bad request')
        ) {
          setMessage('Allready subscribed')
        } else {
          setMessage('Something went wrong')
        }
      },
    })
  })

  return (
    <>
      <PageContent path={'/subscribe'} />
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset className="space-y-2">
          <label htmlFor={'email'} className="block text-xs">
            Email{' '}
            <IfElse
              predicate={errors.email}
              placeholder={<small className="italic">required</small>}
            >
              {({ message }) => (
                <small className="text-xs text-red-600">{message}</small>
              )}
            </IfElse>
          </label>
          <input
            className="block w-full form-input !ring-0 bg-color-100 dark:bg-color-800 placeholder-color-500 dark:text-color-50"
            {...register('email')}
            name="email"
            type="email"
            placeholder="sam.smith@example.com"
            autoComplete="email"
            required
          />
        </fieldset>
        <div className="pt-6 space-x-4">
          <button
            type="submit"
            className="text-lg uppercase md:transition-colors md:ease-in-out md:delay-100 md:text-color-900/0 md:dark:text-color-100/0 md:bg-clip-text md:bg-gradient-to-r md:from-color-900 md:dark:from-color-100 md:hover:from-rose-500 md:to-color-900 md:dark:to-color-100 md:hover:to-cyan-500"
          >
            [subscribe]
          </button>
        </div>
      </form>
      <IfElse predicate={Boolean(message)}>
        {() => (
          <div className="absolute inset-0 grid p-6 bg-color-100 dark:bg-color-800 place-items-start">
            <div>
              <div>{message}</div>
              <button
                type="button"
                className="block mt-6 uppercase cursor-pointer focus:outline-none"
                onClick={onClose}
              >
                [close]
              </button>
            </div>
          </div>
        )}
      </IfElse>
    </>
  )
}

export default memo(Subscribe)
