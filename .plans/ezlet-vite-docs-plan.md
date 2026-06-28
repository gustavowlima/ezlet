# Plano: Ezlet monorepo — biblioteca + website Vite 8

## Objetivo

Evoluir o projeto **Ezlet** como um monorepo com a biblioteca React publicada no npm e um
website Vite para docs, playground e validação visual.

O playground deixa de ser só uma tela de botões e passa a ser um **workspace de documentação e
validação visual**, inspirado na qualidade visual do Sileo Play, mas com identidade própria.

## Decisões Técnicas Atualizadas

- **Nome público:** `Ezlet`.
- **Package name:** preferir `ezlet`; antes de publicar, verificar disponibilidade no npm. Se
  indisponível, usar escopo (`@<scope>/ezlet`) sem mudar a marca.
- **Repo:** `https://github.com/gustavowlima/ezlet`.
- **API pública:** `import { Toaster, toast } from "ezlet"`. Não manter aliases antigos porque
  a lib ainda não foi publicada.
- **Biblioteca:** React + Motion, build com `tsdown`, testes com `bun test`.
- **Monorepo:** usar `apps/site` para o website e `packages/ezlet` para a lib.
- **Workspace manager:** Bun workspaces no root.
- **Publicação npm:** workflow em GitHub Actions disparado por `release.published`.
  - `package.json` não pode ter `private: true`.
  - `files` deve publicar só artefatos necessários (`dist` e README), sem testes/fontes internos
    no tarball.
  - Workflow deve rodar install frozen, lint, typecheck, tests, build e `npm pack --dry-run`
    antes de publicar.
  - Workflow deve falhar se a tag da release não bater com `package.json.version`.
  - Publicação token-based usa `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
  - Publicação com provenance deve declarar `permissions: id-token: write` e usar
    `npm publish --provenance`.
  - Depois do primeiro publish, avaliar migrar para npm Trusted Publishing e remover
    `NPM_TOKEN`.
- **Website/docs:** Vite 8 + React + TypeScript.
  - Context7 confirmou Vite 8 com scripts `vite`, `vite build`, `vite preview`.
  - Context7 confirmou config React TS com `@vitejs/plugin-react`.
- **Routing:** TanStack Router.
  - Context7 confirmou suporte nativo a View Transitions via `defaultViewTransition?: boolean |
    ViewTransitionOptions` no `createRouter`.
  - O router do site deve usar `defaultViewTransition: true`; se o browser não suportar
    `document.startViewTransition()`, o TanStack Router ignora a opção sem quebrar navegação.
  - Navegações internas devem usar `<Link />` e `useNavigate()` do TanStack Router, não estado
    local ad hoc, para páginas/sections passarem pelo mesmo pipeline de transição.
- **View Transitions no site:** obrigatórias para docs/playground.
  - Usar View Transitions para navegação entre páginas, docs, API e workspace.
  - Usar `view-transition-name` em regiões estáveis do layout quando útil: sidebar, header,
    preview, painel de código.
  - Não usar View Transitions para o morph interno do toast. O toast continua usando Motion
    porque conteúdo vivo/spinners não podem virar snapshot estático.
- **Tailwind:** compatibilidade de primeira classe.
  - A lib **não deve depender de Tailwind**.
  - A lib deve expor CSS variables, `classNames`, `data-*` attributes e slots para Tailwind
    customizar perfeitamente.
  - O site/docs pode usar Tailwind v4 via `@tailwindcss/vite`.
  - Context7 confirmou Tailwind v4 com `@import "tailwindcss"` e plugin `@tailwindcss/vite`.
- **Dogfooding no site:** o app de docs importa `ezlet` por alias de Vite apontando para
  `packages/ezlet/src/index.ts` durante dev local, não por paths internos. Os snippets continuam
  mostrando o import real do pacote.

## Arquitetura Alvo

```txt
ezlet/
├─ package.json                    # root workspace + scripts de alto nível
├─ bun.lock
├─ apps/
│  └─ site/
│     ├─ index.html                # Vite root
│     ├─ package.json              # website
│     ├─ vite.config.ts            # Vite 8 + router + Tailwind
│     └─ src/
│        ├─ main.tsx               # RouterProvider
│        ├─ router.tsx             # TanStack Router + defaultViewTransition
│        ├─ routes.tsx             # rotas code-first
│        ├─ route-state.ts         # parse/serialize de search params do workspace
│        ├─ styles.css            # @import "tailwindcss" + design tokens docs
│        ├─ components/
│        ├─ pages/
│        └─ examples/
├─ packages/
│  └─ ezlet/
│     ├─ package.json              # lib publicável no npm
│     ├─ tsdown.config.ts
│     ├─ src/
│     │  ├─ index.ts               # API pública da lib
│     │  ├─ core/
│     │  ├─ react/
│     │  ├─ animation/
│     │  └─ styles/
│     │     └─ ezlet.css           # CSS base da lib
│     └─ README.md
├─ .github/
│  └─ workflows/
│     ├─ publish.yml               # release -> npm publish
│     └─ site-deploy.yml           # push/main -> deploy website
└─ README.md
```

### Vite Config Alvo

- `apps/site/vite.config.ts` deve usar:
  - `react()` de `@vitejs/plugin-react`;
  - `tailwindcss()` de `@tailwindcss/vite`;
  - `root: "."`;
  - `build.outDir: "../../site-dist"`;
  - alias `ezlet` para `../../packages/ezlet/src/index.ts`, garantindo que o site consome a API
    pública em dev local.
- Scripts:
  - `site:dev`: `vite --host 127.0.0.1`;
  - `site:build`: `vite build`;
  - `site:preview`: `vite preview`;
  - `build`: build da lib com `tsdown`, sem virar build do site.

## Design System do Site

### Direção Visual

- Produto: **Ezlet** deve parecer uma ferramenta de UI premium e precisa, não uma landing page
  genérica.
- Inspiração permitida: Sileo Play no senso de acabamento, fundo escuro, foco no componente,
  controles densos e visual sofisticado.
- Não copiar layout/identidade; criar linguagem própria:
  - fundo escuro sólido com painéis sutis;
  - bordas finas;
  - tipografia compacta;
  - workspace central com preview real;
  - documentação lateral navegável;
  - tokens visíveis e editáveis.

### Tokens do Site

- `--ds-bg`
- `--ds-panel`
- `--ds-panel-2`
- `--ds-border`
- `--ds-text`
- `--ds-muted`
- `--ds-accent`
- `--ds-success`
- `--ds-warning`
- `--ds-danger`

### Layout

- **Home:** primeira tela já deve mostrar o componente real em uso, não só marketing.
- **Docs Shell:** sidebar esquerda, conteúdo central, painel direito opcional para live controls.
- **Workspace:** painel operacional para manipular Ezlet:
  - posição;
  - tema;
  - `visibleToasts`;
  - `gap`;
  - duração;
  - expand;
  - preset de animação;
  - tipo de toast;
  - payload/title/description/action.
- **Preview:** área limpa onde os toasts aparecem como apareceriam em uma aplicação real.
- **Code output:** snippet atualizado conforme os controles.
- **Sem landing genérica:** a primeira viewport já deve ser uma experiência usável com preview,
  controles e snippet. Marketing fica subordinado à demonstração real.

## Compatibilidade Tailwind da Lib

### Requisitos da API

- Manter export styled:
  - `import "ezlet/styles.css"`
- Uso padrão deve seguir o padrão Sileo:
  - `import { Toaster, toast } from "ezlet"` sem import manual de CSS.
  - `Toaster` injeta os estilos base uma vez no client.
  - `injectStyles={false}` permite CSS manual.
- Adicionar customização sem colisão:
  - `className`
  - `classNames`
  - `unstyled?: boolean`
  - `injectStyles?: boolean`
  - `renderToast`
  - `icons`
  - CSS variables.
- Adicionar `data-*` attributes estáveis:
  - `data-ezlet-toaster`
  - `data-ezlet-viewport`
  - `data-ezlet-toast`
  - `data-variant`
  - `data-status`
  - `data-expanded`
  - `data-position`
  - `data-stack-index`
  - `data-front`

### Tailwind Examples Obrigatórios

- Customizar com `classNames`:

```tsx
<Toaster
  classNames={{
    toast: "border-zinc-800 bg-zinc-950 text-zinc-50 shadow-2xl",
    title: "font-medium",
    description: "text-zinc-400",
  }}
/>
```

- Customizar com CSS variables em utility classes:

```tsx
<div className="[--ezlet-bg:theme(colors.zinc.950)] [--ezlet-radius:1.25rem]">
  <Toaster />
</div>
```

- Modo unstyled:

```tsx
<Toaster
  unstyled
  classNames={{
    toast: "grid min-h-14 w-96 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-black px-4 text-white",
  }}
/>
```

## Renomeação Para Ezlet

### Arquivos/API

- API pública usa apenas `Toaster`.
- Como a lib ainda não foi publicada, não manter alias legado para o nome anterior.
- CSS:
  - `ezlet.css` é o CSS base da lib.
  - Export `./styles.css` continua apontando para CSS final.
- Classes:
  - Prefixos CSS internos foram migrados para `.ezlet-*`.
  - A troca completa deve ficar coberta por testes.
- Package:
  - `"name": "ezlet"` ou scoped.
  - README e docs: `import { Toaster, toast } from "ezlet"`.

## Tasks

### Task 0 — Estado Atual Da Lib

- [x] Package renomeado para `ezlet`.
- [x] API pública limpa: `Toaster`, `ToasterProps`, `toast`.
- [x] Sem alias legado para nomes antigos.
- [x] CSS base em `packages/ezlet/src/styles/ezlet.css`.
- [x] Estilos automáticos por `injectStyles`, sem import manual obrigatório.
- [x] `unstyled` para Tailwind-only.
- [x] Prefixos estáveis `.ezlet-*`, `--ezlet-*`, `data-ezlet-*`.
- [x] Testes Bun cobrindo portal, style injection, `unstyled`, stacking e core.
- [x] Build da lib com `tsdown` e export `./styles.css`.
- [x] `files` do npm restrito a `dist` e `README.md`.
- [x] Metadados npm básicos: description, license, repository, homepage, bugs e keywords.
- [x] Workflow inicial de publish em `.github/workflows/publish.yml`.

### Task 1 — Estruturar Monorepo

- [x] Criar root `package.json` com workspaces Bun.
- [x] Mover a lib para `packages/ezlet`.
- [x] Mover o website para `apps/site`.
- [x] Ajustar scripts raiz para `build`, `test`, `lint`, `typecheck`, `site:dev`,
  `site:build` e `site:preview`.
- [x] Criar `apps/site/package.json` com dependência local em `ezlet` via workspace.
- [x] Criar `apps/site/index.html`.
- [x] Criar `apps/site/vite.config.ts` com React + Tailwind e alias local para `packages/ezlet`.
- [x] Criar TanStack Router com `defaultViewTransition: true`.
- [x] Criar rotas:
  - `/`
  - `/docs`
  - `/docs/installation`
  - `/docs/usage`
  - `/docs/styling`
  - `/docs/tailwind`
  - `/docs/accessibility`
  - `/docs/api`
  - `/play`
- [x] Criar workflow de deploy do site separado do publish da lib.
- [x] Manter o playground Bun antigo até a paridade visual do novo `/play`.
- [x] Remover `playground/server.ts` e `playground/index.html` após a paridade.

### Task 2 — Criar Design System do Site

- [ ] Criar `apps/site/src/styles.css` com `@import "tailwindcss"` e tokens DS.
- [ ] Importar `apps/site/src/styles.css` em `apps/site/src/main.tsx`.
- [ ] Criar layout base `Shell`, `Sidebar`, `Topbar`, `Workspace`.
- [ ] Criar navegação com TanStack Router:
  - links ativos por rota;
  - search params para estado compartilhável do workspace;
  - View Transition global em toda navegação.
- [ ] Definir `view-transition-name` para regiões persistentes:
  - app shell;
  - sidebar;
  - topbar;
  - preview;
  - docs content;
  - code panel.
- [ ] Criar componentes compartilhados:
  - `CodeBlock`
  - `DemoFrame`
  - `PropTable`
  - `ControlGroup`
  - `SegmentedControl`
  - `Slider`
  - `Toggle`

### Task 3 — Home + Workspace

- [ ] Home com Ezlet real funcionando na primeira viewport.
- [ ] Workspace central com controles reais.
- [ ] Usar `import { Toaster, toast } from "ezlet"` no código do site.
- [ ] Não importar `ezlet/styles.css` no fluxo padrão; deixar `Toaster` injetar estilos.
- [ ] Criar exemplo separado demonstrando `injectStyles={false}` + CSS manual.
- [ ] Preview isolado, com botões:
  - Default
  - Success
  - Error
  - Loading
  - Promise
  - Custom
  - Burst
- [ ] Snippet de código gerado a partir dos controles.
- [ ] Workspace deve persistir estado relevante em URL search params via TanStack Router:
  - `position`
  - `theme`
  - `visibleToasts`
  - `expand`
  - preset.
- [ ] Search params devem ter defaults previsíveis e não gerar URLs ruidosas.
- [ ] Presets visuais:
  - Minimal
  - Glassless
  - Dense
  - System
  - Tailwind custom.

### Task 4 — Docs

- [ ] Página `Installation`.
  - Instalação Bun/npm/pnpm.
  - Uso padrão sem CSS import.
  - Import manual de `ezlet/styles.css` apenas como opção avançada.
- [ ] Página `Usage`.
  - `toast()`, variantes, dismiss, update.
- [ ] Página `Promise`.
  - `toast.promise()` reutilizando id e morph loading -> success/error.
- [ ] Página `Stacking`.
  - `visibleToasts`, `gap`, `expand`, hover, limite visual.
- [ ] Página `Styling`.
  - CSS vars `--ezlet-*`, `classNames`, `injectStyles={false}`.
- [ ] Página `Tailwind`.
  - `unstyled`, utilities, tokens via arbitrary properties.
- [ ] Página `Accessibility`.
  - `role=status|alert`, `aria-live`, keyboard dismiss, reduced motion.
- [ ] Página `API`.
  - `ToasterProps`, `ToastOptions`, `ToastT`, `ToasterTransition`.
- [ ] Página `Motion`.
  - Por que Motion no toast e View Transitions no site.

### Task 5 — API Ezlet + Tailwind

- [x] Introduzir `Toaster` sem alias legado.
- [x] Adicionar `unstyled`.
- [x] Adicionar/estabilizar `data-*` attributes.
- [x] Renomear tokens CSS para `--ezlet-*`.
- [ ] Auditar se `classNames` vence estilos default nos slots principais.
- [ ] Documentar ordem de customização:
  1. CSS vars
  2. `classNames`
  3. `unstyled`
  4. `renderToast`
- [ ] Adicionar exemplos copiáveis para cada camada.

### Task 6 — Validação Visual

- [ ] Usar Playwright para screenshots desktop e mobile:
  - Home
  - Workspace default
  - Stack colapsado
  - Stack expandido
  - Promise loading→success
  - Tailwind custom
- [ ] Conferir console sem erros.
- [ ] Conferir que navegações usam View Transitions quando `document.startViewTransition` existe.
- [ ] Conferir fallback sem erro quando `document.startViewTransition` não existe.
- [ ] Conferir texto sem overflow em mobile.
- [ ] Conferir stack com `visibleToasts=3` e rajadas.
- [ ] Conferir reduced motion.
- [ ] Conferir que nenhum layout depende de texto explicativo para operar os controles.

### Task 7 — Build/Qualidade

- [x] `bun test`
- [x] `bun run typecheck`
- [x] `bun run lint`
- [x] `bun run build`
- [x] `bun run site:build`
- [ ] `bun run site:preview`
- [ ] Validar `exports`:
  - `.`
  - `./styles.css`
- [ ] Validar import em app Vite local via alias `ezlet`.
- [ ] Validar que snippets da docs não usam paths internos (`../src`, `src/react/*`).
- [ ] Rodar busca final por nomes antigos:
  - `IslandToaster`
  - `Islet`
  - `EzletToaster`
  - `island-toast`
  - `.it-*`
  - `--it-*`
- [ ] Atualizar os comandos de validação para o fluxo Bun do monorepo:
  - `bun --cwd packages/ezlet test`
  - `bun --cwd packages/ezlet run build`
  - `bun --cwd packages/ezlet run typecheck`
  - `bun --cwd apps/site run build`
  - `bun --cwd apps/site run typecheck`

### Task 8 — Release E Publish npm

- [x] Configurar repo metadata para `https://github.com/gustavowlima/ezlet`.
- [x] Remover `private: true` antes de publicar.
- [x] Criar workflow `Publish to npm` em release published.
- [x] Usar `bun install --frozen-lockfile`.
- [x] Rodar lint, typecheck, tests e build antes do publish.
- [x] Validar que tag da release corresponde a `package.json.version`.
- [x] Rodar `npm pack --dry-run` para validar conteúdo empacotado.
- [x] Publicar com `npm publish --provenance --access public`.
- [ ] Criar secret `NPM_TOKEN` no GitHub repo se usar token-based publish.
- [ ] Garantir que o token npm tenha permissão de publish para o pacote `ezlet`.
- [ ] Atualizar `package.json.version` antes da release.
- [ ] Criar release GitHub com tag que corresponda ao `version` do `package.json`
  (`v1.2.3` ou `1.2.3`).
- [ ] Após primeiro publish, considerar npm Trusted Publishing:
  - configurar trusted publisher no npm para `gustavowlima/ezlet`;
  - manter `permissions: id-token: write`;
  - remover `NODE_AUTH_TOKEN` e `NPM_TOKEN` do workflow.
- [ ] Antes da primeira release pública, confirmar disponibilidade do nome `ezlet` no npm.

### Task 9 — CI/CD Do Website

- [x] Criar workflow `site-deploy.yml` para deploy do website em `push` na branch principal.
- [x] Restringir o deploy do site para mudanças em `apps/site/**`, `packages/ezlet/**` e workflows.
- [x] Fazer o build do site publicar a partir de `apps/site`.
- [ ] Validar que docs e playground não disparam publish da lib.
- [ ] Validar que mudanças só de docs não alteram `package.json.version`.

## Critérios de Aceite

- Website Vite 8 abre com `bun run site:dev`.
- Docs/playground usam TanStack Router com `defaultViewTransition: true`.
- Navegações do site usam View Transitions, com fallback limpo em browsers sem suporte.
- Site tem home, docs e workspace real.
- Ezlet funciona sem Tailwind.
- Ezlet customiza perfeitamente com Tailwind via `classNames`, CSS vars e `unstyled`.
- Stack/morph continuam suaves no workspace.
- Build da lib e build das docs passam.
- Nenhum erro de console no Playwright.
- README usa o nome Ezlet e aponta para a nova API.
- Snippets principais usam `import { Toaster, toast } from "ezlet"`.
- O site dogfooda a API pública via alias Vite, sem paths internos da lib.
- Release publicada no GitHub dispara workflow npm somente depois de lint/typecheck/test/build.
- `npm pack --dry-run` lista apenas arquivos esperados: `dist`, `package.json` e `README.md`.
- Deploy do site e publish da lib são workflows independentes.
