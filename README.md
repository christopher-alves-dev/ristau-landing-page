# Ristau · Landing page

Landing page das capas de Kindle em crochê da Ristau, feita com Astro + React e hospedada na Vercel.

## Comandos

| Comando            | O que faz                                        |
| :----------------- | :----------------------------------------------- |
| `npm run dev`      | Servidor local em `localhost:4321`               |
| `npm run build`    | Build de produção (saída em `.vercel/output`)    |
| `npm test`         | Testes unitários (Vitest)                        |
| `npm run test:e2e` | Testes e2e (Playwright) sobre o build            |

## Conteúdo editável (Keystatic)

Textos, capas e fotos ficam em `src/content/` e são editados pelo painel em `/admin` (ou `/keystatic`).

- `src/content/capas/<slug>/index.yaml` + `image.(png|webp)`: uma pasta por capa
- `src/content/site.yaml`: marca, slogan, WhatsApp, Instagram, SEO e rodapé
- `src/content/home.yaml`: seções "Feito à mão" e "Como encomendar"

Fotos: só PNG ou WebP com fundo transparente, até 3 MB (o painel bloqueia o resto). A foto da hero (800px de largura) e a miniatura (160px de altura) são geradas em WebP no build, então não é preciso otimizar nada à mão.

Em desenvolvimento o painel grava direto nos arquivos locais. Em produção, cada "Save" vira um commit no GitHub e a Vercel publica de novo.

### Ativar o painel em produção (uma vez só)

1. Mude temporariamente o `storage` em `keystatic.config.tsx` para `{ kind: "github", repo: ... }` e rode `npm run dev`.
2. Abra `http://127.0.0.1:4321/keystatic` e siga o assistente para criar o GitHub App. Ele grava no `.env` as variáveis `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` e `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
3. Desfaça a mudança do passo 1 e cadastre as quatro variáveis na Vercel (Settings → Environment Variables).
4. No GitHub App, adicione a URL de callback do domínio de produção: `https://<domínio>/api/keystatic/github/oauth/callback`.
5. Quem for editar precisa de uma conta no GitHub com acesso de escrita ao repositório.
