import dynamic from 'next/dynamic'

// ssr: false prevents Math.random() and localStorage access from running on the
// server, which would cause a hydration mismatch on the client.
const AppShell = dynamic(() => import('@/components/AppShell'), { ssr: false })

export default function Page() {
  return <AppShell />
}
