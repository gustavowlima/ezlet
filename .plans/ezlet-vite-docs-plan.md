# Plano: Ezlet — biblioteca + playground/docs Vite 8

## Objetivo

Evoluir o projeto **Ezlet**, uma biblioteca React de toasts com
animação Dynamic Island fluida, stacking tipo Sonner e um site/playground/documentação completo.
O playground deixa de ser só uma tela de botões e passa a ser um **workspace de documentação e
validação visual**, inspirado na qualidade visual do Sileo Play, mas com identidade própria.

## Decisões Técnicas Atualizadas

- **Nome público:** `Ezlet`.
- **Package name:** preferir `ezlet`; antes de publicar, verificar disponibilidade no npm. Se
  indisponível, usar escopo (`@<scope>/ezlet`) sem mudar a marca.
- **Biblioteca:** React + Motion, build com `tsdown`, testes com `bun test`.
- **Docs/playground:** Vite 8 + React + TypeScript.
  - Context7 confirmou Vite `v8.0.10` e template React TS com `vite`, `@vitejs/plugin-react`,
    React 19, TS bundler mode e scripts `dev/build/preview`.
- **Routing:** TanStack Router.
  - Context7 confirmou suporte nativo a View Transitions via `defaultViewTransition?: boolean |
    ViewTransitionOptions` no `createRouter`.
  - O router do site deve usar `defaultViewTransition: true`.
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

## Arquitetura Alvo

```txt
ezlet/
├─ package.json
├─ tsdown.config.ts
├─ vite.config.ts                  # docs/playground Vite 8
├─ index.html                      # docs app
├─ src/
│  ├─ index.ts                     # API pública da lib
│  ├─ core/
│  ├─ react/
│  ├─ animation/
│  └─ styles/
│     └─ ezlet.css                 # CSS base da lib
├─ docs/
│  ├─ app/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ router.tsx                  # TanStack Router + defaultViewTransition
│  │  ├─ routes.tsx                  # rotas code-first
│  │  └─ styles.css                # Tailwind v4 + design tokens docs
│  ├─ components/
│  │  ├─ Shell.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ Topbar.tsx
│  │  ├─ CodeBlock.tsx
│  │  ├─ PropTable.tsx
│  │  ├─ DemoFrame.tsx
│  │  └─ Workspace.tsx
│  ├─ pages/
│  │  ├─ Home.tsx
│  │  ├─ Docs.tsx
│  │  ├─ API.tsx
│  │  ├─ Styling.tsx
│  │  ├─ Accessibility.tsx
│  │  └─ Playground.tsx
│  └─ examples/
│     ├─ BasicDemo.tsx
│     ├─ PromiseDemo.tsx
│     ├─ StackingDemo.tsx
│     ├─ TailwindDemo.tsx
│     └─ CustomRenderDemo.tsx
└─ README.md
```

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
  - `toastOptions`
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

### Task 1 — Preparar Vite 8 Docs

- [ ] Instalar `vite@^8`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`.
- [ ] Instalar `@tanstack/react-router`.
- [ ] Criar `vite.config.ts` com React + Tailwind.
- [ ] Criar TanStack Router com `defaultViewTransition: true`.
- [ ] Criar rotas:
  - `/`
  - `/docs`
  - `/docs/installation`
  - `/docs/usage`
  - `/docs/styling`
  - `/docs/tailwind`
  - `/docs/accessibility`
  - `/docs/api`
  - `/play`
- [ ] Trocar `bun run dev` para Vite docs app.
- [ ] Adicionar scripts:
  - `dev`: `vite`
  - `docs:build`: `vite build`
  - `docs:preview`: `vite preview`
  - manter `build` da lib com `tsdown`.
- [ ] Mover playground Bun antigo para `docs/` ou remover após paridade.

### Task 2 — Criar Design System do Site

- [ ] Criar `docs/app/styles.css` com `@import "tailwindcss"` e tokens DS.
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
- [ ] Presets visuais:
  - Minimal
  - Glassless
  - Dense
  - System
  - Tailwind custom.

### Task 4 — Docs

- [ ] Página `Installation`.
- [ ] Página `Usage`.
- [ ] Página `Promise`.
- [ ] Página `Stacking`.
- [ ] Página `Styling`.
- [ ] Página `Tailwind`.
- [ ] Página `Accessibility`.
- [ ] Página `API`.
- [ ] Página `Motion`.

### Task 5 — API Ezlet + Tailwind

- [x] Introduzir `Toaster` sem alias legado.
- [x] Adicionar `unstyled`.
- [x] Adicionar/estabilizar `data-*` attributes.
- [x] Renomear tokens CSS para `--ezlet-*`.
- [ ] Garantir que `classNames` sempre vence estilos default quando possível.
- [ ] Documentar ordem de customização:
  1. CSS vars
  2. `classNames`
  3. `unstyled`
  4. `renderToast`

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

### Task 7 — Build/Qualidade

- [ ] `bun test`
- [ ] `bun run typecheck`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] `bun run docs:build`
- [ ] `bun run docs:preview`
- [ ] Validar `exports`:
  - `.`
  - `./styles.css`
- [ ] Validar import em app Vite local.

## Critérios de Aceite

- Docs Vite 8 abre com `bun run dev`.
- Docs/playground usam TanStack Router com `defaultViewTransition: true`.
- Navegações do site usam View Transitions, com fallback limpo em browsers sem suporte.
- Site tem home, docs e workspace real.
- Ezlet funciona sem Tailwind.
- Ezlet customiza perfeitamente com Tailwind via `classNames`, CSS vars e `unstyled`.
- Stack/morph continuam suaves no workspace.
- Build da lib e build das docs passam.
- Nenhum erro de console no Playwright.
- README usa o nome Ezlet e aponta para a nova API.
