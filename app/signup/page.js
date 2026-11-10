import Link from 'next/link';
import { signup } from '@/app/actions';

export default function SignupPage({ searchParams }) {
  return (
    <main className="auth panel">
      <div className="logo">StockFlow</div>
      <p className="muted">Create your organization</p>
      <form action={signup}>
        <label>Email</label>
        <input name="email" type="email" autoComplete="email" required />
        <label>Organization name</label>
        <input name="organizationName" placeholder="My Test Store" required />
        <label>Password</label>
        <input name="password" type="password" autoComplete="new-password" required />
        <label>Confirm password</label>
        <input name="confirmPassword" type="password" autoComplete="new-password" required />
        {searchParams.error && <p className="err">{searchParams.error}</p>}
        <button className="btn full">Sign up</button>
      </form>
      <p className="muted">Have an account? <Link href="/login">Log in</Link></p>
    </main>
  );
}
