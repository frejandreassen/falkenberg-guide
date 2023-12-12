import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Destination Falkenberg',
  description: 'Simple chat interface',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href='https://fonts.googleapis.com/css2?family=Bodoni+Moda&display=swap' 
          rel="stylesheet"  
        />
        <link 
          href='https://fonts.googleapis.com/css2?family=Montserrat&display=swap' 
          rel="stylesheet"  
        />
      </head>
      <body className="bg-transparent font-montserrat">{children}</body>
    </html>
  )
}
