import { Card } from "@/shared/components/ui/card";
import { formatINR } from "@/shared/utils/utils";

interface VarianceItem {
  name: string;
  category: string;
  amount: number;
  percent: number;
  type: "under" | "over";
}

const VARIANCE_ITEMS: VarianceItem[] = [
  {
    name: "Tooling & Jig Development",
    category: "Engineering Labour",
    amount: -91000,
    percent: -32.5,
    type: "under",
  },
  {
    name: "Design Engineering Hours",
    category: "Engineering Labour",
    amount: -110000,
    percent: -26.2,
    type: "under",
  },
  {
    name: "Environmental & Fatigue Testing",
    category: "Testing",
    amount: -44000,
    percent: -51.8,
    type: "under",
  },
  {
    name: "Purchased Parts — Solenoid Coils",
    category: "Material",
    amount: 15000,
    percent: 8.3,
    type: "over",
  },
  {
    name: "Contingency Reserve",
    category: "Miscellaneous",
    amount: 8000,
    percent: 20,
    type: "over",
  },
];

export function VarianceHighlights() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Top Variance Items</h3>
        <p className="text-sm text-muted-foreground">Biggest over and under-spend line items</p>
      </div>
      <div className="space-y-4">
        {VARIANCE_ITEMS.map((item, index) => (
          <VarianceItemRow key={index} item={item} />
        ))}
      </div>
    </Card>
  );
}

function VarianceItemRow({ item }: { item: VarianceItem }) {
  const isUnder = item.type === "under";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`text-lg ${isUnder ? "text-green-600" : "text-red-600"}`}>
          {isUnder ? "💚" : "🔴"}
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.category}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium ${isUnder ? "text-green-600" : "text-red-600"}`}>
          {isUnder ? "−" : "+"}₹{Math.abs(item.amount).toLocaleString()}
        </div>
        <div className={`text-sm ${isUnder ? "text-green-600" : "text-red-600"}`}>
          {item.percent.toFixed(1)}% {item.type}
        </div>
      </div>
    </div>
  );
}
