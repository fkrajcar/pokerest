import './globals.css'
import { Inter } from 'next/font/google'
import '@mantine/core/styles.css'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
const inter = Inter({ subsets: ['latin'] })
export const metadata = {
  title: 'Pokerest',
  description: 'Estimate your tasks with',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className={inter.className}>
        <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>
      </body>
    </html>
  )
}
