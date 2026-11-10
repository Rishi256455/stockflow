import Link from 'next/link';
import { saveProduct } from '@/app/actions';

export default function ProductForm({ product, error }) {
  const p = product || {};
  return (
    <form action={saveProduct} className="panel form">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <label>Name</label>
      <input name="name" defaultValue={p.name ?? ''} required />
      <label>SKU</label>
      <input name="sku" defaultValue={p.sku ?? ''} required />
      <label>Description</label>
      <textarea name="description" rows="2" defaultValue={p.description ?? ''} />
      <div className="grid2">
        <div>
          <label>Quantity on hand</label>
          <input name="quantity" type="number" step="1" min="0" defaultValue={p.quantity ?? 0} required />
        </div>
        <div>
          <label>Low stock threshold</label>
          <input name="lowStockThreshold" type="number" step="1" min="0" placeholder="Use default" defaultValue={p.lowStockThreshold ?? ''} />
        </div>
        <div>
          <label>Cost price (₹)</label>
          <input name="costPrice" type="number" step="0.01" min="0" defaultValue={p.costPrice ?? ''} />
        </div>
        <div>
          <label>Selling price (₹)</label>
          <input name="sellingPrice" type="number" step="0.01" min="0" defaultValue={p.sellingPrice ?? ''} />
        </div>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="actions">
        <Link href="/products" className="btn ghost">Cancel</Link>
        <button className="btn">Save product</button>
      </div>
    </form>
  );
}
