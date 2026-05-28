# Deploy — Vidacosmetic&mas

## Arquitectura en producción

```
Browser → Firebase SDK → Firestore / Auth / Storage
```

No hay servidor propio. Firebase Hosting sirve los estáticos. El SDK maneja las conexiones directo desde el browser. `npm run dev` es solo para desarrollo local.

---

## Deploy completo

```powershell
npm run build
firebase deploy
```

## Deploy parcial

```powershell
# Solo frontend
firebase deploy --only hosting

# Solo reglas Firestore
firebase deploy --only firestore:rules

# Solo índices
firebase deploy --only firestore:indexes

# Solo rules + índices
firebase deploy --only firestore:rules,firestore:indexes

# Solo Functions
npm --prefix functions run build
firebase deploy --only functions
```

---

## Setup inicial (una sola vez)

```powershell
# 1. Login Firebase CLI
firebase login

# 2. Verificar proyecto activo
firebase use bleaks-producctions

# 3. Deploy rules e índices
firebase deploy --only firestore:rules,firestore:indexes

# 4. Sembrar datos iniciales
$env:GOOGLE_APPLICATION_CREDENTIALS="scripts/serviceAccountKey.json"
npm run seed

# 5. Crear usuario admin
npm run create-admin
# → Email: admin@vidacosmetic.com / Password: Admin1234!
```

---

## URLs

| Recurso | URL |
|---|---|
| App producción | https://bleaks-producctions.web.app |
| Firebase Console | https://console.firebase.google.com/project/bleaks-producctions |
| Firestore | https://console.firebase.google.com/project/bleaks-producctions/firestore |
| Auth | https://console.firebase.google.com/project/bleaks-producctions/authentication |
| Storage | https://console.firebase.google.com/project/bleaks-producctions/storage |

---

## Variables de entorno

Archivo `.env` (no commitear — ver `.env.example`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATORS=false
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Credenciales Admin SDK

`scripts/serviceAccountKey.json` — NO commitear. Solo para scripts locales de seed/admin.
