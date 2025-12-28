import AgentApplicationList from './AgentApplicationList'

export default function AgentApplicationsPage() {
  // We intentionally fetch applications client-side inside `AgentApplicationList`
  // because the agent identity is derived from the client's session token.
  // Server-side fetch with the internal secret cannot determine the current
  // agent user id and may return incorrect results or 500 when server config
  // is missing. Client fetch uses the signed-in agent token.

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Applications</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Applications assigned to you. Review details and add remarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Count is shown inside the client list once loaded */}
          <span className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            — Assigned
          </span>
        </div>
      </div>

      {/* List Component (client-side) */}
      <AgentApplicationList initialData={[]} />
    </div>
  )
}
