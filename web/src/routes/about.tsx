import { createFileRoute } from '@tanstack/react-router'
import { FC } from 'react'

const Page: FC = () => {
  return <div className="p-2">Hello from About!</div>
}

export const Route = createFileRoute('/about')({
  component: Page,
})
