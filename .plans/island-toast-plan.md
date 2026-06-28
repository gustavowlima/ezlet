# Plano: `island-toast` — toast React com animação estilo Dynamic Island

## Context

Criar do zero (`/Volumes/Gustavo_SSD/dev/island-toast`, diretório vazio) uma biblioteca de
toasts para **React** cujo diferencial é o **morph fluido** inspirado na Dynamic Island do
iPhone: uma "pílula" única que muda de tamanho/forma com física de mola (spring), conteúdo
que troca suavemente e **empilhamento (stacking)** no estilo Sonner. Deve ser bonita
out-of-the-box (styled) e altamente customizável. Tooling em **Bun**.

Inspirações: Sonner (stacking, DX da API imperativa), Sileo (estética Dynamic Island),
Motion (motor de animação).

### Avaliação: API nativa vs Motion (decisão central)

O usuário pediu "o mais performático E fiel possível, avaliando APIs nativas primeiro".
Conclusão da avaliação:

- **View Transitions API nativa** (`document.startViewTransition`) dá morph FLIP composto
  na GPU e fora da main thread — ótimo em performance. **Porém é inadequada para este caso**:
  1. Durante a transição o conteúdo vira *snapshot estático* (`::view-transition-old/new`) —
     um spinner de `loading` ou texto vivo **congela** no meio do morph (quebra a fidelidade).
  2. Easing nativo é CSS timing-function — **não há spring real** (só aproximação via `linear()`),
     então perde o "rubber" característico do iOS.
  3. **Concorrência única** por documento e **interrupção mid-flight ruim** — fatal para toasts
     que chegam/saem em rajada (o caso de uso principal).
- **Motion convencional (`motion/react`) com `layout` + spring** resolve os três pontos:
  spring físico fiel, conteúdo permanece **vivo** durante o morph, totalmente **interrompível**
  e concorrente. Performance mantida usando **transform/opacity compostos** no stacking e
  animando width/height/border-radius apenas no elemento-pílula (que é pequeno → barato).

**Decisão:** motor = **Motion (`motion/react`)** com `layout`/`layoutId` + springs afinados ao
iOS. View Transitions API fica como *enhancement opcional* só para efeitos page-wide (ex.: wipe
de tema), nunca para o morph do toast. Isto entrega o resultado "mais performático e fiel"
viável na prática.

## Decisões fixadas

- **Framework:** só React (peerDeps `react`, `react-dom`).
- **Estilo:** styled + 100% customizável via CSS variables/tokens + render slots.
- **Animação:** Motion layout + spring (avaliação acima).
- **Tooling:** Bun (runtime, package manager, `bun test`).

## Arquitetura

Pacote único `island-toast` (publicável), com separação interna clara entre *core* (estado,
API imperativa, sem JSX) e *react* (componentes/morph). Facilita extrair um `core` agnóstico
depois sem reescrever lógica.

```
island-toast/
├─ package.json            # bun, "type":"module", exports "." + "./styles.css", peer react
├─ tsconfig.json
├─ tsdown.config.ts        # build ESM + .d.ts (rolldown, Bun-friendly)
├─ biome.json              # lint/format (rápido, Bun-friendly)
├─ src/
│  ├─ index.ts             # API pública: toast, IslandToaster, tipos
│  ├─ core/
│  │  ├─ store.ts          # store externo + useSyncExternalStore (sem re-render por context)
│  │  ├─ toast.ts          # API imperativa: toast(), .success/.error/.loading/.promise/.custom/.update/.dismiss
│  │  ├─ timers.ts         # auto-dismiss com pause-on-hover / pause-on-blur
│  │  └─ types.ts          # ToastT, Position, Theme, SpringPreset, IslandToasterProps
│  ├─ react/
│  │  ├─ IslandToaster.tsx # portal (createPortal→body), região aria-live, posiciona a ilha, mapeia stack
│  │  ├─ Island.tsx        # pílula que faz morph (motion layout + layoutId="island")
│  │  ├─ ToastItem.tsx     # item: ícone/variante, conteúdo, ações, AnimatePresence interno
│  │  ├─ hooks.ts          # useToasts(), useReducedMotion(), useExpanded()
│  │  └─ icons.tsx         # ícones default (success/error/loading/info), overrideáveis
│  ├─ animation/
│  │  ├─ springs.ts        # presets iOS: morph/enter/exit (stiffness/damping/mass)
│  │  └─ geometry.ts       # math do stacking estilo Sonner (offset/scale/opacity/blur)
│  └─ styles/
│     ├─ island-toast.css  # tokens (CSS vars) + layout base + dark/light
│     └─ variants.css      # cores por variante (success/error/loading/info/custom)
├─ playground/             # app Vite+React p/ testar visualmente (bun run dev)
└─ README.md
```

## Detalhes de implementação

### 1. Estado e API imperativa (`core/`)
- `store.ts`: array de toasts + `subscribe/getSnapshot/emit`; consumido via
  `useSyncExternalStore` (evita re-render global). Padrão Sonner.
- `toast.ts`: função `toast(message, opts)` retorna `id`; métodos `.success/.error/.loading/
  .info/.custom/.promise/.update/.dismiss`. `promise()` faz `loading→success/error` reusando
  `update` no mesmo `id` (o morph anima a troca de conteúdo automaticamente).
- `timers.ts`: timers com `pause`/`resume` em hover e em `visibilitychange`/blur de janela.

### 2. O morph da ilha (`react/Island.tsx`) — o coração
- Um **único** container `motion.div` com `layout` e `layoutId="island"` permanece montado;
  trocamos só o conteúdo interno. Mudança de tamanho → Motion anima width/height/border-radius
  com **spring**, gerando o morph líquido.
- Conteúdo interno via `AnimatePresence mode="popLayout"`: sai com blur+fade+scale, entra
  igual → as trocas (loading→success) ficam suaves sem congelar (vantagem sobre VT nativa).
- `springs.ts` morph preset inicial: `{ type:"spring", stiffness:400, damping:32, mass:1 }`
  (tunável por prop). `will-change:transform` ligado só durante a animação.

### 3. Stacking estilo Sonner (`animation/geometry.ts` + `IslandToaster.tsx`)
- Toasts atrás empilham com `translateY` + `scale` decrescente + opacidade/blur — **só
  transform/opacity** (composto na GPU).
- `visibleToasts` (default 3) limita nós vivos; demais ficam colapsados.
- **Expand on hover** (e/ou prop `expand`): leque vira lista vertical com `layout` animando
  cada item para sua posição. Front toast = "ilha ativa".

### 4. Estilo e customização
- Tokens CSS: `--it-bg --it-fg --it-radius --it-blur --it-shadow --it-gap --it-width
  --it-font` + por-variante `--it-success/-error/-loading/-info`.
- Props de `<IslandToaster>`: `position` (default `top-center`), `theme` (`light|dark|system`),
  `expand`, `visibleToasts`, `gap`, `offset`, `duration`, `transition`/`springs`, `icons`,
  `classNames` (slots: toaster/toast/title/description/icon/actionButton), `toastOptions`.
- Slots de render: `toast.custom((id)=>JSX)`, `icon` por toast, `render` override.

### 5. Acessibilidade e robustez
- Região `aria-live` (`polite` default, `assertive` p/ error), `role=status|alert`.
- **`prefers-reduced-motion`**: desliga spring/morph → crossfade instantâneo (hook
  `useReducedMotion`).
- Dismiss por teclado, swipe-to-dismiss (drag), pause-on-hover, foco gerenciado.

### 6. Tooling Bun
- `bun init`; deps: `motion`; peer: `react`,`react-dom`; dev: `tsdown`, `@biomejs/biome`,
  `happy-dom`, `@testing-library/react`, `vite` (playground).
- Build: **tsdown** (rolldown) → ESM + `.d.ts` + CSS. `exports`: `"."` e `"./styles.css"`.
- Testes: `bun test` com happy-dom (store, timers, promise lifecycle). Visual no playground.
- Scripts: `dev` (playground), `build` (tsdown), `test` (bun test), `lint` (biome).

## Plano de execução por tasks

### Task 1 — Scaffold de pacote Bun
- [x] Base `bun init`.
- [x] Ajustar `package.json` para entrada de biblioteca inicial: `exports`, `files`,
  scripts Bun de teste/typecheck e peer deps React.
- [x] Criar estrutura `src/` inicial.
- [x] Adicionar `sideEffects` e export inicial de `./styles.css`.
- [x] Configurar `bunfig.toml` com preload de teste DOM.
- [x] Adicionar script `build`, build config `tsdown` e lint config Biome.
- [x] Adicionar script `dev` e playground.

### Task 2 — Core sem React
- [x] `types.ts`: contrato público inicial de toast, variantes, callbacks e opções.
- [x] `store.ts`: store externo com `subscribe/getSnapshot`, mutações imutáveis e helpers de
  reset só para testes.
- [x] `timers.ts`: timer pausável/resumível para auto-dismiss.
- [x] `toast.ts`: API imperativa `toast()`, `.success`, `.error`, `.info`, `.loading`,
  `.custom`, `.update`, `.dismiss`, `.remove`, `.pause`, `.resume`, `.promise`.
- [x] Garantir que `promise()` reutiliza o mesmo `id` para animar `loading -> success/error`.
- [x] Expandir tipos iniciais de posição, tema, classNames e props React.
- [x] Integrar pause-on-hover e pause-on-visibility no React layer.
- [x] Expandir props de render/custom slots na Task 7.

### Task 3 — Testes nativos Bun para o core
- [x] Usar somente `bun test`, com arquivos `*.test.ts` localizados em `src/**` ou `test/**`
  (padrões nativos do Bun: `*.test.{js|jsx|ts|tsx}`, `*_test.*`, `*.spec.*`, `*_spec.*`).
- [x] Importar helpers de `bun:test`: `test`, `expect`, `describe`, `beforeEach`, `afterEach`.
- [x] Testar store: add/update/dismiss/remove/clear, ordenação e emissão de subscribers.
- [x] Testar timers com fake timers compatíveis com Jest (`jest.useFakeTimers()`,
  `jest.advanceTimersByTime()`, `jest.useRealTimers()`).
- [x] Testar `toast.promise`: estado inicial loading, success/error final e reuse de id.
- [x] Usar `bun test --watch` durante desenvolvimento e `bun test` como verificação final.
- [x] Adicionar testes explícitos de callbacks `onDismiss`/`onAutoClose` e remoção em lote.

### Task 4 — Render base React
- [x] `IslandToaster`: portal para `document.body`, regiões `aria-live`, posições e subscribe via
  `useSyncExternalStore`.
- [x] `ToastItem`: render estático styled, ações, botão dismiss e roles `status|alert`.
- [x] Testes DOM com `bun test` + `happy-dom` via preload.
- [x] Melhorar a11y do botão dismiss e suportar override de render.

### Task 5 — Morph com Motion
- [x] `Island.tsx`: container `motion.div` com `layout` e spring inicial.
- [x] Troca de conteúdo com `AnimatePresence mode="popLayout"` sem congelar conteúdo vivo.
- [x] `prefers-reduced-motion`: desabilitar morph e manter crossfade simples.
- [x] Extrair presets para `animation/springs.ts`.
- [x] Corrigir entrada para não aparecer instantaneamente: `AnimatePresence` da lista com initial/animate/exit.
- [ ] Expor configuração de springs por prop.

### Task 6 — Stacking e interação
- [x] `geometry.ts`: offset, escala e opacidade por índice usando transform/opacity.
- [x] `visibleToasts`, expand-on-hover e pause-on-hover.
- [x] Pause-on-visibilitychange.
- [x] Adicionar blur por índice e refinar origem por posição bottom/top.
- [x] Swipe-to-dismiss e dismiss por teclado.
- [x] Corrigir stack colapsado para já mostrar camadas visuais sem hover, com conteúdo completo só ao expandir.
- [x] Manter toasts dismissed montados por curto delay para permitir exit animation antes de remover.

### Task 7 — Customização e estilos
- [x] CSS tokens e variantes iniciais: `--it-bg`, `--it-fg`, radius, shadow, font e cores.
- [x] `theme=light|dark|system` e `classNames` iniciais.
- [x] Exportar `./styles.css`.
- [x] Finalizar `icons` e render/custom slots.
- [ ] Finalizar tokens de gap/width.

### Task 8 — Build, playground e docs
- [x] `tsdown` para ESM + `.d.ts` + CSS.
- [x] Playground React para validação visual com Bun.
- [x] README com exemplos mínimos, promise, comandos e playground.
- [x] Expandir README com custom render.
- [ ] Expandir README com estilos e acessibilidade.

## Verificação

- `bun test` — runner oficial do Bun. Cobrir store (add/update/dismiss/remove/clear), timers
  pausáveis com fake timers, e `toast.promise` (loading→success/error).
- `bun test --watch` — ciclo local durante desenvolvimento.
- `bun test --preload ./test/setup-dom.ts` — quando houver testes React/DOM com `happy-dom`.
- `bun run dev` (playground) — validar visualmente: morph loading→success, rajada de toasts
  (interrupção/stacking), expand-on-hover, troca light/dark, swipe-to-dismiss,
  `prefers-reduced-motion` (DevTools rendering) caindo p/ crossfade.
- `bun run build` — confere saída ESM + `.d.ts` + `styles.css` e o `exports` resolvendo.
- Sanidade de performance: DevTools Performance — confirmar que stacking usa transform/opacity
  compostos e não dispara layout/paint por frame.
