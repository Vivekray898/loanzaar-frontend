// This catch-all has been removed. All routes are now defined as native Next.js routes.
// See src/app/(public), src/app/(auth), src/app/dashboard, src/app/admin, etc.

export default function CatchAll() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>The route you are looking for does not exist.</p>
    </div>
  )
}
