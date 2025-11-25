import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HallyuLatino',
  description: 'Korean content streaming platform for Latin America',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
