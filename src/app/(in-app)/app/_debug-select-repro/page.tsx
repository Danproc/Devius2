"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";

/**
 * Minimal Radix Select Repro
 *
 * This is a bare-bones test to isolate whether the infinite loop is:
 * 1. In the Radix packages themselves (duplicate React, version skew)
 * 2. In your wrapper components
 * 3. In the page tree/providers
 *
 * If this page loops → it's environment-level (React duplication, Radix versions)
 * If this is fine → the problem is in your wrapper or form integration
 */
export default function DebugSelectRepro() {
  const [value, setValue] = React.useState<string | undefined>(undefined);

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20, fontSize: 24 }}>Debug: Minimal Radix Select</h1>

      <p style={{ marginBottom: 20, color: "#666" }}>
        This is a minimal Radix Select with no react-hook-form, no custom wrappers,
        no FormControl. If this loops, it's an environment issue.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Test Select:
        </label>

        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "white",
              minWidth: 200,
              cursor: "pointer",
            }}
          >
            <Select.Value placeholder="Pick an option" />
            <Select.Icon>
              <ChevronDownIcon style={{ width: 16, height: 16 }} />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              style={{
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 6,
                padding: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: 200,
              }}
            >
              <Select.Viewport>
                <Select.Item
                  value="option-a"
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  <Select.ItemText>Option A</Select.ItemText>
                </Select.Item>

                <Select.Item
                  value="option-b"
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  <Select.ItemText>Option B</Select.ItemText>
                </Select.Item>

                <Select.Item
                  value="option-c"
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  <Select.ItemText>Option C</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div style={{ marginTop: 30, padding: 16, background: "#f0f0f0", borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          <strong>Current value:</strong> {value || "(none selected)"}
        </p>
      </div>

      <div style={{ marginTop: 30, padding: 16, background: "#e8f4f8", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Test Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
          <li>Open your browser console</li>
          <li>Try clicking the select trigger above</li>
          <li>Select an option</li>
          <li>Watch for "Maximum update depth exceeded" error</li>
        </ol>

        <p style={{ marginTop: 12, marginBottom: 0, fontSize: 14 }}>
          <strong>If this page crashes:</strong> The issue is in your environment
          (duplicate React or Radix version skew).
        </p>
        <p style={{ marginBottom: 0, fontSize: 14 }}>
          <strong>If this works fine:</strong> The issue is in your custom Select wrapper
          or react-hook-form integration.
        </p>
      </div>
    </div>
  );
}
