import ProductForm from '@/components/ProductForm';

export default function NewProduct({ searchParams }) {
  return (
    <>
      <h1>Add product</h1>
      <ProductForm error={searchParams.error} />
    </>
  );
}
