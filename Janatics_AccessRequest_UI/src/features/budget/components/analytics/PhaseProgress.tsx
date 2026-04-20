import { Card } from "@/shared/components/ui/card";

interface Phase {
  name: string;
  planned: number;
  actual: number;
  progress: number;
  status: "complete" | "over" | "in-progress" | "not-started";
}

const PHASES: Phase[] = [
  {
    name: "Product Design",
    planned: 620000,
    actual: 620000,
    progress: 100,
    status: "complete",
  },
  {
    name: "Concept Dev",
    planned: 480000,
    actual: 512000,
    progress: 100,
    status: "over",
  },
  {
    name: "Prototype Dev",
    planned: 1850000,
    actual: 1432000,
    progress: 77,
    status: "in-progress",
  },
  {
    name: "Product Testing",
    planned: 940000,
    actual: 0,
    progress: 0,
    status: "not-started",
  },
  {
    name: "Capital Equip.",
    planned: 2200000,
    actual: 0,
    progress: 0,
    status: "not-started",
  },
  {
    name: "Field Validation",
    planned: 310000,
    actual: 0,
    progress: 0,
    status: "not-started",
  },
];

export function PhaseProgress() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Phase-wise Budget Progress</h3>
        <p className="text-sm text-muted-foreground">All 6 development phases · NPD-2025-07</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((phase) => (
          <PhaseCard key={phase.name} phase={phase} />
        ))}
      </div>
    </Card>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const borderColorClass = {
    "in-progress": "border-blue-200 bg-blue-50",
    complete: "border-green-200 bg-green-50",
    over: "border-red-200 bg-red-50",
    "not-started": "border-gray-200 opacity-60",
  }[phase.status];

  const progressColor = {
    complete: "bg-green-600",
    over: "bg-red-600",
    "in-progress": "bg-blue-600",
    "not-started": "bg-gray-400",
  }[phase.status];

  const statusTextColor = {
    complete: "text-green-600",
    over: "text-red-600",
    "in-progress": "text-blue-600",
    "not-started": "text-gray-500",
  }[phase.status];

  const statusLabel = {
    complete: "✓ Complete",
    over: `⚠ ${((phase.actual / phase.planned) * 100 - 100).toFixed(1)}% Over`,
    "in-progress": `▶ In Progress ${phase.progress}%`,
    "not-started": "Not Started",
  }[phase.status];

  return (
    <div className={`p-4 rounded-lg border ${borderColorClass}`}>
      <div className="font-medium mb-2">{phase.name}</div>
      <div className="flex justify-between text-sm mb-2">
        <span>₹{(phase.planned / 100000).toFixed(2)}L</span>
        <span className={phase.status === "over" ? "text-red-600" : ""}>
          ₹{(phase.actual / 100000).toFixed(2)}L
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${phase.progress}%` }}
        ></div>
      </div>
      <div className={`text-xs font-medium ${statusTextColor}`}>
        {statusLabel}
      </div>
    </div>
  );
}
