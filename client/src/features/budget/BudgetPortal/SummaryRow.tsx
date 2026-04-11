import { formatINR, formatPercent } from "./utils/format";
import { varianceClassName } from "./utils/ui";

interface Props {
  actual: number;
  label: string;
  planned: number;
  subtle?: boolean;
  variance: number;
  variancePercent: number;
}

export function SummaryRow({ actual, label, planned, subtle = false, variance, variancePercent }: Props) {
  const rowClass = subtle ? "bg-muted/20" : "bg-primary/10";
  const tone = varianceClassName(variance);

  return (
    <tr className={rowClass}>
      <td className="px-4 py-3 font-medium text-foreground">{label}</td>
      <td className="px-4 py-3 text-right text-foreground">{formatINR(planned)}</td>
      <td className="px-4 py-3 text-right text-foreground">{formatINR(actual)}</td>
      <td className={`px-4 py-3 text-right ${tone}`}>{formatINR(variance)}</td>
      <td className={`px-4 py-3 text-right ${tone}`}>{formatPercent(variancePercent)}</td>
    </tr>
  );
}

