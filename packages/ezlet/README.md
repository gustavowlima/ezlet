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

Base styles are injected automatically by the toaster. Customize the default skin with CSS variables
or slot classes:

```tsx
<Toaster
  classNames={{
    toast: "border border-zinc-800 bg-zinc-950 text-white",
    title: "font-semibold",
    description: "text-zinc-400",
  }}
/>;
```

For fully custom isolated toasts, render your own JSX:

```tsx
toast.custom((item) => (
  <div className="flex w-full items-center rounded-lg bg-white p-4 shadow-lg">
    <p className="text-sm font-medium text-gray-900">Custom toast {item.id}</p>
    <button onClick={() => toast.dismiss(item.id)}>Close</button>
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
