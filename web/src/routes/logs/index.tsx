import { createFileRoute } from '@tanstack/react-router'

import { AllLogsSection } from '@/components/logs/AllLogsSection'
import { SCPage } from '@/layouts/SimpleCenterPage'

export const Route = createFileRoute('/logs/')({
  component: () => {
    return (
      <SCPage title="Logs" width="2xl">
        <div className="card">
          <p>
            Logs are emitted anytime an item is created, edited, or updated.
            This pages provides a full overview of all logs on this instance.
          </p>
        </div>
        <AllLogsSection />
      </SCPage>
    )
  },
})
