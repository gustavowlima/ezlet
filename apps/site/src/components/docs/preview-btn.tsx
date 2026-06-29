import { Button } from "@/components/motion/button";

export function PreviewBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}
