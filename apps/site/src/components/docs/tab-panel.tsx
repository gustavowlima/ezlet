import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import type { ReactNode } from "react";
import { ShikiCodeBlock } from "./shiki-code-block";

interface TabPanelProps {
  preview: ReactNode;
  // Raw code string — displayed in the Code tab with syntax highlighting.
  // This is highlighted at build time via Shiki when used in MDX code fences,
  // but here we display it as plain monospace since it's a prop string.
  code: string;
}

export function TabPanel({ preview, code }: TabPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-site-border)] bg-[var(--color-card)]">
      <Tabs defaultValue="preview" variant="underline">
        <TabsList className="border-b-0 px-4 pt-0">
          <TabsTrigger value="preview" className="text-[13px]">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-[13px]">
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <div className="flex min-h-[128px] items-center justify-center border-t border-[var(--color-site-border)] p-4">
            {preview}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="border-t border-[var(--color-site-border)]">
            <ShikiCodeBlock code={code} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
