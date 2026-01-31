import './globals.css';
import { Inter } from 'next/font/google';
import './map-styles.css'; // Import the map styles we created

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Agrithozha - Agricultural Monitoring',
  description: 'Agricultural field monitoring and analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
