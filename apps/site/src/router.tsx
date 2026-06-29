import { MDXProvider } from "@mdx-js/react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "ezlet";
import { Github } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { mdxComponents } from "@/docs/mdx-components";
import type { DocMeta } from "@/docs/types";
import { Home } from "./home";
import { App } from "./main";

// ── MDX page imports ──────────────────────────────────────────────────────────

import ToastMdx, { frontmatter as toastFm } from "./docs/api/toast.mdx";
import ToasterMdx, { frontmatter as toasterFm } from "./docs/api/toaster.mdx";
import AccessibilityMdx, { frontmatter as a11yFm } from "./docs/guides/accessibility.mdx";
import MotionMdx, { frontmatter as motionFm } from "./docs/guides/motion.mdx";
import StylingMdx, { frontmatter as stylingFm } from "./docs/guides/styling.mdx";
import TailwindMdx, { frontmatter as tailwindFm } from "./docs/guides/tailwind.mdx";
import KickstartMdx, { frontmatter as kickstartFm } from "./docs/kickstart.mdx";

// ── Shell ────────────────────────────────────────────────────────────────────

function RootShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="min-h-dvh bg-[var(--color-site-bg)] text-[var(--color-foreground)]">
      {pathname.startsWith("/docs") ? <Toaster position="bottom-right" /> : null}
      <header
        className="sticky top-0 z-50 border-b border-[var(--color-site-border)] bg-[var(--color-site-bg)]/90 backdrop-blur-lg"
        style={{ viewTransitionName: "site-header" }}
      >
        <div className="mx-auto flex h-auto w-full max-w-[1200px] flex-col gap-3 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
          <Link
            to="/"
            className="text-[15px] font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity hover:opacity-70"
          >
            Ezlet
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
            <a
              href="https://github.com/gustavowlima/ezlet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13.5px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
            >
              <Github size={14} />
              GitHub
            </a>
            <NavLink to="/docs">Docs</NavLink>
            <NavLink to="/play">Playground</NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main style={{ viewTransitionName: "site-main" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-[13.5px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)] data-[status=active]:text-[var(--color-foreground)]"
      activeProps={{ "data-status": "active" }}
      activeOptions={{ exact: false }}
      viewTransition
    >
      {children}
    </Link>
  );
}

// ── Docs layout ───────────────────────────────────────────────────────────────

function DocsLayout() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] flex-col px-4 sm:px-6 lg:flex-row lg:items-start"
      style={{ viewTransitionName: "docs-layout" }}
    >
      <aside className="w-full border-b border-[var(--color-site-border)] py-6 lg:sticky lg:top-14 lg:w-[220px] lg:shrink-0 lg:self-start lg:border-b-0 lg:py-10 lg:pr-6">
        <div className="max-h-none overflow-visible lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          <SideSection label="Basics">
            <SideLink to="/docs" exact>
              Kickstart
            </SideLink>
          </SideSection>
          <SideSection label="API">
            <SideLink to="/docs/toaster">Toaster</SideLink>
            <SideLink to="/docs/toast">toast</SideLink>
          </SideSection>
          <SideSection label="Guides">
            <SideLink to="/docs/styling">Styling</SideLink>
            <SideLink to="/docs/tailwind">Tailwind</SideLink>
            <SideLink to="/docs/accessibility">Accessibility</SideLink>
            <SideLink to="/docs/motion">Motion</SideLink>
          </SideSection>
        </div>
      </aside>
      <div className="hidden w-px shrink-0 bg-[var(--color-site-border)] lg:block" />
      <section className="min-w-0 flex-1 py-8 lg:py-10 lg:pl-10">
        <Outlet />
      </section>
    </div>
  );
}

function SideSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-7">
      <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]/60">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SideLink({ to, children, exact = false }: { to: string; children: ReactNode; exact?: boolean }) {
  return (
    <Link
      to={to}
      className="block rounded-md px-3 py-1.5 text-[14px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)] data-[status=active]:bg-[var(--color-foreground)]/[0.07] data-[status=active]:text-[var(--color-foreground)]"
      activeOptions={{ exact }}
      activeProps={{ "data-status": "active" }}
      viewTransition
    >
      {children}
    </Link>
  );
}

// ── MDX page renderer ─────────────────────────────────────────────────────────

function DocsMdxPage({ Component, meta }: { Component: ComponentType; meta: DocMeta }) {
  return (
    <article className="max-w-none space-y-8 lg:max-w-[700px]">
      <header className="space-y-2">
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-foreground)] sm:text-[26px]">
          {meta.title}
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.6] text-[var(--color-muted-foreground)] sm:text-[15px] sm:leading-[1.55]">
          {meta.description}
        </p>
      </header>
      <div className="space-y-7">
        <MDXProvider components={mdxComponents}>
          <Component />
        </MDXProvider>
      </div>
    </article>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootShell });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Home });
const playRoute = createRoute({ getParentRoute: () => rootRoute, path: "play", component: App });
const docsRoute = createRoute({ getParentRoute: () => rootRoute, path: "docs", component: DocsLayout });

const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/",
  component: () => <DocsMdxPage Component={KickstartMdx} meta={kickstartFm} />,
});

const toasterRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "toaster",
  component: () => <DocsMdxPage Component={ToasterMdx} meta={toasterFm} />,
});

const toastRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "toast",
  component: () => <DocsMdxPage Component={ToastMdx} meta={toastFm} />,
});

const stylingRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "styling",
  component: () => <DocsMdxPage Component={StylingMdx} meta={stylingFm} />,
});

const tailwindRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "tailwind",
  component: () => <DocsMdxPage Component={TailwindMdx} meta={tailwindFm} />,
});

const a11yRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "accessibility",
  component: () => <DocsMdxPage Component={AccessibilityMdx} meta={a11yFm} />,
});

const motionRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "motion",
  component: () => <DocsMdxPage Component={MotionMdx} meta={motionFm} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  playRoute,
  docsRoute.addChildren([
    docsIndexRoute,
    toasterRoute,
    toastRoute,
    stylingRoute,
    tailwindRoute,
    a11yRoute,
    motionRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultViewTransition: true });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function SiteRouter() {
  return <RouterProvider router={router} />;
}
