interface Props {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

export function TopTabButton({ active, disabled = false, label, onClick }: Props) {
  const activeClass = active
    ? "bg-primary text-primary-foreground shadow-md shadow-blue-950/20"
    : "text-muted-foreground hover:bg-accent hover:text-foreground";

  const disabledClass = disabled
    ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground"
    : "";

  return (
    <button
      className={`rounded-xl px-4 py-1 text-sm font-medium transition ${activeClass} ${disabledClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

