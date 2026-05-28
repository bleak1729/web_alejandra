// Crea usuario admin en Firebase Auth + documento en Firestore.
// Uso: node scripts/create-admin.js
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Falta GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}

initializeApp();

const auth = getAuth();
const db = getFirestore();

const ADMIN_EMAIL = 'admin@vidacosmetic.com';
const ADMIN_PASSWORD = 'Admin1234!';

async function createAdmin() {
  let uid;

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Usuario ya existe: ${uid}`);
  } catch {
    const user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Admin',
    });
    uid = user.uid;
    console.log(`Usuario creado: ${uid}`);
  }

  await db.collection('usuarios').doc(uid).set({
    uid,
    nombre: 'Admin',
    email: ADMIN_EMAIL,
    telefono: '',
    direccion: { calle: '', ciudad: '', pais: '', codigoPostal: '' },
    rol: 'admin',
    creadoEn: FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Documento /usuarios/${uid} → rol: admin`);
  console.log(`\nCredenciales:\n  Email:    ${ADMIN_EMAIL}\n  Password: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

createAdmin().catch((e) => { console.error(e); process.exit(1); });
