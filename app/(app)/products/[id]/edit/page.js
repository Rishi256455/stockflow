import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import ProductForm from '@/components/ProductForm';

export default async function EditProduct({ params, searchParams }) {
  const session = await requireSession();
  const product = await prisma.product.findFirst({
    where: { id: params.id, organizationId: session.oid },
  });
  if (!product) notFound();
  return (
    <>
      <h1>Edit product</h1>
      <ProductForm product={product} error={searchParams.error} />
    </>
  );
}
