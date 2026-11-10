import Link from 'next/link';
import { login } from '@/app/actions';

export default function LoginPage({ searchParams }) {
  return (
    <main className="auth panel">
      <div className="logo">StockFlow</div>
      <p className="muted">Log in to your inventory</p>
      <form action={login}>
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" required />
        <label>Password</label>
        <input name="password" type="password" autoComplete="current-password" required />
        {searchParams.error && <p className="err">{searchParams.error}</p>}
        <button className="btn full">Log in</button>
      </form>
      <p className="muted">New here? <Link href="/signup">Sign up</Link></p>
    </main>
  );
}
