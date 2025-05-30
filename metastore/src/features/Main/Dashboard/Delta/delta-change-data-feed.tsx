import React from "react";

interface DeltaChangeDataFeedProps {
  metadata: any;
}

export function DeltaChangeDataFeed({ metadata }: DeltaChangeDataFeedProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Delta Lake Change Data Feed
        </h2>

        <div className="space-y-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium mb-2">Change Data Feed Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Enabled</span>
            </div>
          </div>

          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium mb-2">Recent Changes</h3>
            {metadata ? (
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                No change data available
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-background p-4 rounded-md border">
              <h3 className="font-medium mb-2">Configure CDC</h3>
              <div className="flex space-x-2 mt-2">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                  Enable CDC
                </button>
                <button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm">
                  Disable CDC
                </button>
              </div>
            </div>

            <div className="bg-background p-4 rounded-md border">
              <h3 className="font-medium mb-2">Export Changes</h3>
              <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-sm">
                Export Change Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
