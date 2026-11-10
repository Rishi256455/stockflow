import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isLow, money } from '@/lib/stock';
import { adjustStock, deleteProduct } from '@/app/actions';
import DeleteForm from '@/components/DeleteForm';

export default async function Products({ searchParams }) {
  const session = await requireSession();
  const org = await prisma.organization.findUnique({ where: { id: session.oid } });
  const q = (searchParams.q || '').trim();
  const products = await prisma.product.findMany({
    where: {
      organizationId: session.oid,
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <h1>Products</h1>
      <form className="bar" method="get">
        <input name="q" placeholder="Search by name or SKU" defaultValue={q} />
        <button className="btn ghost">Search</button>
        <Link href="/products/new" className="btn">Add product</Link>
      </form>
      {searchParams.error && <p className="err">{searchParams.error}</p>}
      <div className="panel tw">
        {products.length ? (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>SKU</th><th className="n">Quantity</th><th>Status</th>
                <th className="n">Selling price</th><th>Adjust stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td className="n">{p.quantity}</td>
                  <td>{isLow(p, org) ? <span className="badge">Low stock</span> : <span className="muted">In stock</span>}</td>
                  <td className="n">{money(p.sellingPrice)}</td>
                  <td>
                    <form action={adjustStock} className="adj">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="delta" type="number" step="1" placeholder="+/- units" required />
                      <input name="note" placeholder="Note" />
                      <button className="btn ghost sm">Apply</button>
                    </form>
                  </td>
                  <td>
                    <div className="rowact">
                      <Link href={`/products/${p.id}/edit`} className="btn ghost sm">Edit</Link>
                      <DeleteForm action={deleteProduct} id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">{q ? 'No products match your search.' : 'No products yet. Select “Add product” to create one.'}</p>
        )}
      </div>
    </>
  );
}
