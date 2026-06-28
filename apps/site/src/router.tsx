import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { App } from "./main";

function RootShell() {
  return (
    <div className="min-h-dvh bg-[var(--site-bg)] text-white">
      <header
        className="sticky top-0 z-50 border-b border-white/8 bg-[#08090ce6] backdrop-blur-xl"
        style={{ viewTransitionName: "site-header" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold">
              E
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Ezlet</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">toast workspace</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink to="/">Workspace</NavLink>
            <NavLink to="/docs">Docs</NavLink>
            <NavLink to="/play">Play</NavLink>
          </nav>
        </div>
      </header>
      <main className="min-h-[calc(100dvh-4rem)]" style={{ viewTransitionName: "site-main" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-white/70 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white data-[status=active]:border-white/20 data-[status=active]:bg-white/[0.08] data-[status=active]:text-white"
      activeProps={{ "data-status": "active" }}
      viewTransition
    >
      {children}
    </Link>
  );
}

function DocsLayout() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside
        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
        style={{ viewTransitionName: "docs-sidebar" }}
      >
        <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/35">Docs</div>
        <div className="flex flex-col gap-1 text-sm">
          <DocsLink to="/docs">Overview</DocsLink>
          <DocsLink to="/docs/installation">Installation</DocsLink>
          <DocsLink to="/docs/usage">Usage</DocsLink>
          <DocsLink to="/docs/styling">Styling</DocsLink>
          <DocsLink to="/docs/tailwind">Tailwind</DocsLink>
          <DocsLink to="/docs/accessibility">Accessibility</DocsLink>
          <DocsLink to="/docs/api">API</DocsLink>
        </div>
      </aside>
      <section
        className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        style={{ viewTransitionName: "docs-content" }}
      >
        <Outlet />
      </section>
    </div>
  );
}

function DocsLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-xl px-3 py-2 text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white data-[status=active]:bg-white/[0.08] data-[status=active]:text-white"
      activeProps={{ "data-status": "active" }}
      viewTransition
    >
      {children}
    </Link>
  );
}

function DocPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Ezlet docs</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-white/55">{description}</p>
      </header>
      <div className="space-y-4 text-sm leading-6 text-white/75">{children}</div>
    </article>
  );
}

function DocsOverview() {
  return (
    <DocPage
      title="Overview"
      description="Ezlet ships as a small React toast library with Motion-driven stacking, promise morphing, and Tailwind-friendly customization."
    >
      <p>
        Use the workspace to trigger real toasts, inspect stack behavior, and copy the public API directly
        from the same source the package exports.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard title="Workspace">Interactive playground for live toast testing.</InfoCard>
        <InfoCard title="Docs">Focused reference for install, usage, styling, and API shape.</InfoCard>
      </div>
    </DocPage>
  );
}

function InstallationPage() {
  return (
    <DocPage
      title="Installation"
      description="Install the package with Bun, npm, or pnpm. The default runtime path injects base styles automatically."
    >
      <pre className="overflow-x-auto rounded-xl border border-white/8 bg-black/30 p-4 text-xs text-white/80">
        <code>{`bun add ezlet
npm i ezlet
pnpm add ezlet`}</code>
      </pre>
      <p>
        For manual styling control, import <code>ezlet/styles.css</code> or set
        <code> injectStyles={false}</code> and provide your own utilities.
      </p>
    </DocPage>
  );
}

function UsagePage() {
  return (
    <DocPage
      title="Usage"
      description="Trigger default, success, error, loading, and custom toasts through the public API."
    >
      <pre className="overflow-x-auto rounded-xl border border-white/8 bg-black/30 p-4 text-xs text-white/80">
        <code>{`import { Toaster, toast } from "ezlet";

toast.success("Saved");
toast.promise(fetchData(), { messages: { loading: "Loading...", success: "Done", error: "Failed" } });`}</code>
      </pre>
      <p>
        Promise toasts reuse the same id across loading and settled states so the transition stays morphable.
      </p>
    </DocPage>
  );
}

function StylingPage() {
  return (
    <DocPage
      title="Styling"
      description="Customize Ezlet with CSS variables, classNames, or fully unstyled rendering."
    >
      <InfoCard title="CSS variables">Use `--ezlet-*` tokens for theme-level changes.</InfoCard>
      <InfoCard title="classNames">Target slots like toast, content, title, and description.</InfoCard>
      <InfoCard title="unstyled">Strip the base skin and apply Tailwind utilities directly.</InfoCard>
    </DocPage>
  );
}

function TailwindPage() {
  return (
    <DocPage
      title="Tailwind"
      description="Ezlet does not depend on Tailwind, but it exposes stable hooks that make Tailwind customization straightforward."
    >
      <pre className="overflow-x-auto rounded-xl border border-white/8 bg-black/30 p-4 text-xs text-white/80">
        <code>{`<Toaster
  unstyled
  classNames={{
    toast: "rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-2xl",
  }}
/`}</code>
      </pre>
    </DocPage>
  );
}

function AccessibilityPage() {
  return (
    <DocPage
      title="Accessibility"
      description="The component uses status and alert semantics, supports dismissal, and respects reduced motion."
    >
      <InfoCard title="Announcements">Informational toasts use status; errors use alert.</InfoCard>
      <InfoCard title="Keyboard">Escape dismisses the focused toast.</InfoCard>
      <InfoCard title="Motion">
        Reduced-motion users get instant layout changes without spring motion.
      </InfoCard>
    </DocPage>
  );
}

function ApiPage() {
  return (
    <DocPage
      title="API"
      description="The public surface is intentionally small: Toaster, toast, and the typed options around them."
    >
      <InfoCard title="ToasterProps">
        Controls position, visibleToasts, expand, gap, offset, and transitions.
      </InfoCard>
      <InfoCard title="toast">Creates, updates, dismisses, and resolves promise toasts.</InfoCard>
      <InfoCard title="classNames">
        Slot-based overrides keep the API friendly to Tailwind and custom CSS.
      </InfoCard>
    </DocPage>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-4">
      <div className="mb-1 text-sm font-medium text-white">{title}</div>
      <div className="text-sm leading-6 text-white/55">{children}</div>
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootShell });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "play",
  component: App,
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "docs",
  component: DocsLayout,
});

const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/",
  component: DocsOverview,
});

const installationRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "installation",
  component: InstallationPage,
});

const usageRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "usage",
  component: UsagePage,
});

const stylingRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "styling",
  component: StylingPage,
});

const tailwindRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "tailwind",
  component: TailwindPage,
});

const accessibilityRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "accessibility",
  component: AccessibilityPage,
});

const apiRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "api",
  component: ApiPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  playRoute,
  docsRoute.addChildren([
    docsIndexRoute,
    installationRoute,
    usageRoute,
    stylingRoute,
    tailwindRoute,
    accessibilityRoute,
    apiRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultViewTransition: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function SiteRouter() {
  return <RouterProvider router={router} />;
}
