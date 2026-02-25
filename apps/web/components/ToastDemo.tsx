"use client";

import { useToast } from "@/lib/toast";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useState } from "react";

/**
 * Toast System Demo
 *
 * Showcases all toast types and features
 */
export function ToastDemo() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const simulateAsync = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Success!", "Operation completed successfully");
    } catch (error) {
      toast.error("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Toast System Demo</h2>

      <div className="space-y-4">
        {/* Toast Types */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Toast Types
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => toast.success("Success!", "This is a success toast")}
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error("Error!", "This is an error toast")}
            >
              Error Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning("Warning!", "This is a warning toast")}
            >
              Warning Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.info("Info", "This is an info toast")}>
              Info Toast
            </Button>
          </div>
        </div>

        {/* Custom Messages */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Custom Messages
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                toast.success("Changes Saved", "Your profile has been updated successfully")
              }
            >
              Profile Update
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.error("Payment Failed", "Your card was declined. Please try again.")
              }
            >
              Payment Error
            </Button>
          </div>
        </div>

        {/* Duration Demo */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Custom Durations
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => toast.info("Quick Toast", "This disappears in 2 seconds", 2000)}
            >
              Quick (2s)
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Standard Toast", "This disappears in 5 seconds", 5000)}
            >
              Standard (5s)
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Persistent Toast", "Click the X to dismiss this", 0)}
            >
              Persistent (Manual)
            </Button>
          </div>
        </div>

        {/* Async Operations */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Async Operations
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button isLoading={loading} onClick={simulateAsync}>
              {loading ? "Processing..." : "Simulate Async Operation"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast.show({
                  type: "info",
                  title: "Saving...",
                  duration: 0, // Don't auto-dismiss
                });
                setTimeout(() => toast.clearAllToasts(), 3000);
              }}
            >
              Persistent Loading
            </Button>
          </div>
        </div>

        {/* Stack Management */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Stack Management
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                for (let i = 1; i <= 3; i++) {
                  setTimeout(() => {
                    toast.info(`Toast ${i}`, `This is notification number ${i}`);
                  }, i * 300);
                }
              }}
            >
              Show 3 Toasts
            </Button>
            <Button variant="secondary" onClick={() => toast.clearAllToasts()}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Callback Demo */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Callbacks
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                toast.show({
                  type: "success",
                  title: "Custom Action",
                  message: "Watch the console when dismissed",
                  duration: 5000,
                  onDismiss: () => {
                    console.log("Toast was dismissed!");
                  },
                });
              }}
            >
              Show Toast with Callback
            </Button>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The Toast system is built into the app. Import{" "}
          <code className="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-slate-800">useToast</code>{" "}
          from{" "}
          <code className="rounded bg-slate-200 px-2 py-1 text-xs dark:bg-slate-800">
            @/lib/toast
          </code>{" "}
          to use it anywhere in your app. See{" "}
          <a
            href="https://github.com/docs/TOAST_SYSTEM.md"
            className="text-blue-600 hover:underline"
          >
            TOAST_SYSTEM.md
          </a>{" "}
          for full documentation.
        </p>
      </div>
    </Card>
  );
}
