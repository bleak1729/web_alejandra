// Detecta y elimina productos duplicados por nombre.
// Uso: node scripts/check-duplicates.js [--fix]
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Falta GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}

initializeApp();
const db = getFirestore();

const fix = process.argv.includes('--fix');

async function run() {
  const snap = await db.collection('productos').get();
  const todos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  console.log(`Total productos: ${todos.length}`);

  const grupos = {};
  for (const p of todos) {
    const key = p.nombre?.trim().toLowerCase();
    if (!key) continue;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  }

  const duplicados = Object.entries(grupos).filter(([, v]) => v.length > 1);

  if (duplicados.length === 0) {
    console.log('Sin duplicados.');
    process.exit(0);
  }

  console.log(`\nDuplicados encontrados: ${duplicados.length} nombres`);
  for (const [nombre, items] of duplicados) {
    console.log(`\n  "${nombre}" — ${items.length} docs:`);
    items.forEach((p, i) => console.log(`    [${i}] ${p.id} | stock:${p.stock} | activo:${p.activo}`));
  }

  if (!fix) {
    console.log('\nEjecuta con --fix para eliminar duplicados (conserva el primero por cada nombre).');
    process.exit(0);
  }

  console.log('\nEliminando duplicados...');
  for (const [, items] of duplicados) {
    const [keep, ...remove] = items;
    console.log(`  Conserva: ${keep.id}`);
    for (const p of remove) {
      await db.collection('productos').doc(p.id).delete();
      console.log(`  Eliminado: ${p.id}`);
    }
  }
  console.log('\nListo.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
