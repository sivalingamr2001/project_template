import { Card } from "@/shared/components/ui/card";

export function VarianceHighlights() {
  // Sample variance data - in real app, this would be calculated from actual data
  const varianceItems = [
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

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Top Variance Items</h3>
        <p className="text-sm text-muted-foreground">Biggest over and under-spend line items</p>
      </div>
      <div className="space-y-4">
        {varianceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`text-lg ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "under" ? "💚" : "🔴"}
              </div>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.category}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "under" ? "−" : "+"}₹{Math.abs(item.amount).toLocaleString()}
              </div>
              <div className={`text-sm ${item.type === "under" ? "text-green-600" : "text-red-600"}`}>
                {item.percent.toFixed(1)}% {item.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}