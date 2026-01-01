type OpenSignInModalOpts = {
  query: string
}

export function openSignInModal({ query }: OpenSignInModalOpts) {
  if (typeof window === 'undefined') return

  try {
    const url = new URL(window.location.href)
    // Merge incoming query params
    const params = new URLSearchParams(query.replace(/^[?]/, ''))
    for (const [k, v] of Array.from(params.entries())) {
      if (v === '') params.delete(k)
      else url.searchParams.set(k, v)
    }

    // Push state so SignInModal can detect it. Mark modalOpened for back/replace behavior.
    window.history.pushState({ ...(window.history.state || {}), modalOpened: true }, '', url.pathname + url.search)
    // Fire events so any URL watchers (useSearchParams, popstate listeners) notice the change immediately
    try { window.dispatchEvent(new CustomEvent('signin-opened', { detail: { query } })) } catch (e) {}
    try { window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state })) } catch (e) {}
  } catch (e) {
    // Fallback to replacing location
    const fallback = window.location.pathname + (query || '')
    window.location.href = fallback
  }
}
