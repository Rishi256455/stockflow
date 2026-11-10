import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { saveSettings } from '@/app/actions';

export default async function Settings({ searchParams }) {
  const session = await requireSession();
  const org = await prisma.organization.findUnique({ where: { id: session.oid } });
  return (
    <>
      <h1>Settings</h1>
      <form action={saveSettings} className="panel form" style={{ maxWidth: 420 }}>
        <label>Default low stock threshold</label>
        <input name="defaultLowStockThreshold" type="number" min="0" step="1" defaultValue={org.defaultLowStockThreshold} required />
        <p className="muted">Used for products with no threshold of their own.</p>
        {searchParams.error && <p className="err">{searchParams.error}</p>}
        {searchParams.saved && <p className="ok">Settings saved.</p>}
        <button className="btn">Save settings</button>
      </form>
    </>
  );
}
