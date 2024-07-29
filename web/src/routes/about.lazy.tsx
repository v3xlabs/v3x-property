import { createLazyFileRoute } from '@tanstack/react-router'
import { FC } from 'react'


const component: FC = () => {
    return <div className="p-2">Hello from About!</div>
}

export const Route = createLazyFileRoute('/about')({
    component,
})
