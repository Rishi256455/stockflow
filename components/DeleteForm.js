'use client';

export default function DeleteForm({ action, id, name }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn ghost sm">Delete</button>
    </form>
  );
}
