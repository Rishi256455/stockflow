import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logout } from '@/app/actions';

export default async function AppLayout({ children }) {
  const session = await requireSession();
  const org = await prisma.organization.findUnique({ where: { id: session.oid } });
  return (
    <div className="wrap">
      <header className="top">
        <span className="logo">StockFlow</span>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/products">Products</Link>
          <Link href="/settings">Settings</Link>
        </nav>
        <span className="muted">{org?.name}</span>
        <form action={logout}>
          <button className="btn ghost sm">Log out</button>
        </form>
      </header>
      {children}
    </div>
  );
}
