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

Promise lifecycle keeps the same toast id, so the island morphs from loading to final state:

```ts
await toast.promise(saveProfile(), {
  messages: {
    loading: "Saving profile",
    success: "Profile saved",
    error: "Save failed",
  },
});
```

Custom content keeps the default shell, timing, stacking, and dismiss behavior:

```tsx
toast.custom((item) => (
  <div>
    <strong>Upload #{item.id}</strong>
    <span>Rendered with toast.custom.</span>
  </div>
));
```

## Development

```bash
bun install
bun test
bun run typecheck
bun run lint
bun run build
```

Run the playground:

```bash
bun run dev
```

The playground uses `Bun.serve()` with HTML imports and lives in `playground/`.
