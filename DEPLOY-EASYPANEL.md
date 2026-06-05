# Deploy no EasyPanel — Frontend (profrontend)

Repositório: `V1ctorgomes/profrontend`

## Configuração do serviço

| Aba | Valor |
|-----|-------|
| **Source** | `V1ctorgomes/profrontend`, branch `main` |
| **Build** | Dockerfile → `Dockerfile` (raiz) |
| **Porta** | `3000` |

## Variáveis de ambiente (aba Environment)

No EasyPanel, variáveis da aba **Environment** entram no build e no runtime:

```
NEXT_PUBLIC_API_URL=https://sua-url-do-backend.com/api
```

> URL pública do backend com `/api` no final. Ao mudar, faça **redeploy**.

## Backend — CORS

No serviço do backend, configure:

```
FRONTEND_URL=https://sua-url-do-frontend.com
```

## Verificar

Acesse a URL do frontend → tela de login deve aparecer.
