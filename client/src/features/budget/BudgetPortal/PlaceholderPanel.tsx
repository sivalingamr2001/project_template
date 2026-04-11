interface Props {
  description: string;
  title: string;
}

export function PlaceholderPanel({ description, title }: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-background/40 p-10 text-center">
      <div className="font-display text-xl text-foreground">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

