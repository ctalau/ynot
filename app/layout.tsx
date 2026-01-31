import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'yNot - yGuard Deobfuscator',
  description: 'Deobfuscate Java stack traces obfuscated by yGuard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
