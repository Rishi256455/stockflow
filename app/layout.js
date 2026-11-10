import './globals.css';

export const metadata = { title: 'StockFlow', description: 'Simple multi-tenant inventory' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
