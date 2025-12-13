export const parts = [
  { id: 'p1', name: 'Oil Filter', stock: 50, price: 250 },
  { id: 'p2', name: 'Air Filter', stock: 40, price: 300 },
  { id: 'p3', name: 'Brake Pad Set', stock: 25, price: 1200 },
  { id: 'p4', name: 'Spark Plug', stock: 100, price: 150 }
];

export function findPart(id) {
  return parts.find(p => p.id === id);
}

export function reservePart(id, qty) {
  const p = findPart(id);
  if (!p) return null;
  if (p.stock < qty) return false;
  p.stock -= qty;
  return true;
}