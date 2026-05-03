import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Video Generator',
  description: 'Genera videos a partir de texto e imágenes con inteligencia artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
        {children}
      </body>
    </html>
  )
}