# Deploy EasyPanel — Frontend (igual ao CRM)

Repositório: `V1ctorgomes/profrontend`

## Serviço no EasyPanel

| Aba | Valor |
|-----|-------|
| Source | `V1ctorgomes/profrontend` / `main` |
| Build | Dockerfile → `Dockerfile` (raiz) |
| Porta | `3000` |
| Réplicas | `1` |

## Environment (mesma aba do CRM)

```env
NODE_ENV=production

NEXT_PUBLIC_API_URL=https://progrifes-progrifes_backend.SEU-HOST.easypanel.host/api
INTERNAL_API_URL=https://progrifes-progrifes_backend.SEU-HOST.easypanel.host/api
```

> No CRM a URL não tem `/api`; no ERP precisa do sufixo `/api`.

## Backend — CORS

```env
FRONTEND_URL=https://progrifes-progrifes_frontend.SEU-HOST.easypanel.host
```

## Verificar

URL do frontend → tela de login
