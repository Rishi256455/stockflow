import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isLow, thresholdFor } from '@/lib/stock';

export default async function Dashboard() {
  const session = await requireSession();
  const org = await prisma.organization.findUnique({ where: { id: session.oid } });
  const products = await prisma.product.findMany({
    where: { organizationId: session.oid },
    orderBy: { name: 'asc' },
  });
  const total = products.reduce((a, p) => a + p.quantity, 0);
  const lowItems = products.filter((p) => isLow(p, org));

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat"><b>{products.length}</b><span>Total products</span></div>
        <div className="stat"><b>{total}</b><span>Units on hand</span></div>
      </div>
      <div className="panel">
        <h2>Low stock items</h2>
        {lowItems.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr><th>Name</th><th>SKU</th><th className="n">Quantity on hand</th><th className="n">Low stock threshold</th></tr>
              </thead>
              <tbody>
                {lowItems.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td className="n">{p.quantity}</td>
                    <td className="n">{thresholdFor(p, org)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty">{products.length ? 'Nothing is running low.' : 'Add your first product to start tracking stock.'}</p>
        )}
      </div>
    </>
  );
}
