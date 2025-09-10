# Municipio - Control de Partes (React + Firebase)

Proyecto mínimo para controlar en tiempo real (Firestore) qué áreas enviaron el parte diario.

## Pasos rápidos

1. Crear proyecto en Firebase Console:
   - Habilitar Firestore Database (modo prueba para empezar está OK).
   - Crear un Web App en el proyecto y copiar la configuración (firebaseConfig).

2. Abrir `src/firebase.js` y pegar tu configuración en el objeto `firebaseConfig`.

3. Subir a GitHub:
   - Abrir la carpeta del proyecto en VS Code.
   - Ejecutar en la terminal (dentro de la carpeta del proyecto):
     ```
     git init
     git add .
     git commit -m "Primer commit - proyecto base"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
     git push -u origin main
     ```

4. Deploy en Netlify / Vercel:
   - Conectar tu cuenta de GitHub y elegir este repositorio.
   - Netlify/Vercel correrán `npm install` y `npm run build` automáticamente.

5. Cargar datos iniciales (opcional):
   - Puedes usar el panel de Firestore para crear documentos en la colección `areas`.
   - Cada documento debe tener al menos:
     ```
     {
       cod: "1.4.1.2.",
       nombre: "DIRECCION DE ASISTENCIA TECNICA TRIBUTARIA",
       nivel: 3,
       parentCod: "1.4.1.",
       enviado: false,
       updatedBy: null,
       updatedAt: null
     }
     ```

## Archivos clave
- `src/firebase.js` -> pegar tu firebaseConfig allí.
- `src/App.jsx` -> lógica principal + UI básica.
- `src/components/*` -> componentes: AreaList, SearchBar, ResetButton.

## Notas
- No incluyo `node_modules` en el repo. Netlify / Vercel instalarán dependencias automáticamente.
- Si querés, te puedo generar también un script para importar tu Excel a Firestore.

