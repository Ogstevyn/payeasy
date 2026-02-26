import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { IconShowcase } from "@/components/icons/IconShowcase";
import { ICON_NAMES } from "@/components/icons";

describe("IconShowcase", () => {
  it("renders heading and all registered icon names", () => {
    render(<IconShowcase />);

    expect(screen.getByRole("heading", { name: "Icon Library" })).toBeInTheDocument();

    for (const name of ICON_NAMES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });
});
