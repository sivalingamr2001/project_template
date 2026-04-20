import { Card } from "@/shared/components/ui/card";

export function PhaseProgress() {
  // Sample phase data - in real app, this would come from project phases
  const phases = [
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

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Phase-wise Budget Progress</h3>
        <p className="text-sm text-muted-foreground">All 6 development phases · NPD-2025-07</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              phase.status === "in-progress"
                ? "border-blue-200 bg-blue-50"
                : phase.status === "complete"
                ? "border-green-200 bg-green-50"
                : "border-gray-200 opacity-60"
            }`}
          >
            <div className="font-medium mb-2">{phase.name}</div>
            <div className="flex justify-between text-sm mb-2">
              <span>₹{(phase.planned / 100000).toFixed(2)}L</span>
              <span className={phase.status === "over" ? "text-red-600" : ""}>
                ₹{(phase.actual / 100000).toFixed(2)}L
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${
                  phase.status === "complete"
                    ? "bg-green-600"
                    : phase.status === "over"
                    ? "bg-red-600"
                    : phase.status === "in-progress"
                    ? "bg-blue-600"
                    : "bg-gray-400"
                }`}
                style={{ width: `${phase.progress}%` }}
              ></div>
            </div>
            <div
              className={`text-xs font-medium ${
                phase.status === "complete"
                  ? "text-green-600"
                  : phase.status === "over"
                  ? "text-red-600"
                  : phase.status === "in-progress"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {phase.status === "complete" && "✓ Complete"}
              {phase.status === "over" && `⚠ ${(phase.actual / phase.planned * 100 - 100).toFixed(1)}% Over`}
              {phase.status === "in-progress" && `▶ In Progress ${phase.progress}%`}
              {phase.status === "not-started" && "Not Started"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}