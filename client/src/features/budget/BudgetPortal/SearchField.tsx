import { Input } from "@/shared/components/ui/input";

interface Props {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SearchField({ label, onChange, placeholder, value }: Props) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <label className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <Input placeholder={placeholder} value={value} onChange={handleChange} />
    </label>
  );
}

