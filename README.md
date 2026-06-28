# island-toast

Dynamic Island-style toast library for React, powered by Bun and Motion.

## Usage

```tsx
import { IslandToaster, toast } from "island-toast";
import "island-toast/styles.css";

export function App() {
  return (
    <>
      <button onClick={() => toast.success("Saved")}>Show toast</button>
      <IslandToaster position="top-center" theme="system" />
    </>
  );
}
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
