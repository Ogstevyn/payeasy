import React from "react";
import { render } from "@testing-library/react";
import { Icon } from "@/components/Icon";
import { ICON_NAMES } from "@/components/icons";

describe("Performance - Icon", () => {
  const RENDER_BUDGET_MS = 120;

  it("renders all registered icons within budget", () => {
    const start = performance.now();

    render(
      <div>
        {ICON_NAMES.map((name) => (
          <Icon key={name} name={name} size="md" />
        ))}
      </div>
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(RENDER_BUDGET_MS);
  });
});
