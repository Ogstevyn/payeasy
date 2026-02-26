import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Icon } from "@/components/Icon";

describe("Icon", () => {
  it("renders a registry icon", () => {
    render(<Icon name="search" data-testid="icon-search" />);
    expect(screen.getByTestId("icon-search")).toBeInTheDocument();
  });

  it("supports size tokens", () => {
    render(<Icon name="bell" size="lg" data-testid="icon-size" />);
    expect(screen.getByTestId("icon-size")).toHaveAttribute("width", "32");
    expect(screen.getByTestId("icon-size")).toHaveAttribute("height", "32");
  });

  it("supports numeric size and color", () => {
    render(<Icon name="heart" size={18} color="#7D00FF" data-testid="icon-color" />);
    expect(screen.getByTestId("icon-color")).toHaveAttribute("width", "18");
    expect(screen.getByTestId("icon-color")).toHaveAttribute("stroke", "#7D00FF");
  });

  it("adds default hover animation classes when animate is enabled", () => {
    render(<Icon name="settings" animate data-testid="icon-animate-default" />);
    expect(screen.getByTestId("icon-animate-default")).toHaveClass("motion-safe:hover:scale-105");
  });

  it("supports pulse animation variant", () => {
    render(<Icon name="loader" animate animationVariant="pulse" data-testid="icon-pulse" />);
    expect(screen.getByTestId("icon-pulse")).toHaveClass("motion-safe:animate-pulse");
  });

  it("supports spin animation variant", () => {
    render(<Icon name="loader" animate animationVariant="spin" data-testid="icon-spin" />);
    expect(screen.getByTestId("icon-spin")).toHaveClass("motion-safe:animate-spin");
  });

  it("supports non-decorative accessibility", () => {
    render(<Icon name="check" title="Success" data-testid="icon-a11y" />);
    const icon = screen.getByTestId("icon-a11y");
    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("aria-label", "Success");
  });
});
