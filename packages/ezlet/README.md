# Ezlet

Dynamic Island-style toast library for React, powered by Bun and Motion.

## Usage

```tsx
import { Toaster, toast } from "ezlet";

export function App() {
  return (
    <>
      <button onClick={() => toast.success("Saved")}>Show toast</button>
      <Toaster position="top-center" theme="system" />
    </>
  );
}
```

Base styles are injected automatically by the toaster. If you want to manage CSS manually, import
the stylesheet and disable injection:

```tsx
import { Toaster } from "ezlet";
import "ezlet/styles.css";

<Toaster injectStyles={false} />;
```

For Tailwind-only styling, skip the default CSS:

```tsx
<Toaster
  unstyled
  classNames={{
    toast: "grid min-h-14 w-96 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-black px-4 text-white",
  }}
/>;
```

## Development

```bash
bun install
bun test
bun run typecheck
bun run lint
bun run build
```
