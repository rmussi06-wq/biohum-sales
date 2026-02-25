# Biohum Visitas (PWA)

PWA para gerenciamento de visitas médicas (tablet), hospedado no GitHub Pages, com banco no Firestore (Firebase).

## 1) Pré-requisitos
- Node.js 18+
- Conta Firebase

## 2) Firebase (Firestore)
1. Crie um projeto no Firebase
2. Ative **Firestore Database**
3. Regras (exemplo simples para começar — ajuste depois):
   - Permitir leitura/escrita (modo teste) temporariamente

## 3) Configure as chaves do Firebase
Crie um arquivo `.env` na raiz:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
# Para GitHub Pages:
VITE_BASE=/NOME_DO_REPO/
```

## 4) Visual Aid por especialidade (Drive)
Edite:
`src/lib/specialties.js`

E coloque os links das pastas do Drive em `VISUAL_AID_LINKS`.

## 5) Rodar local
```
npm install
npm run dev
```

## 6) Deploy no GitHub Pages (rápido)
1. Suba o repositório para o GitHub
2. Instale deps e gere build:
   ```
   npm install
   VITE_BASE=/NOME_DO_REPO/ npm run build
   ```
3. Deploy com gh-pages:
   ```
   npm run deploy
   ```

Se preferir, dá para usar GitHub Actions também.

## Estrutura Firestore (sugestão)
- `prescribers` (clientes)
- `prescribers/{id}/availability` (horários fixos)
- `visits` (histórico)