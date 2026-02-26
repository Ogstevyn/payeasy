import { Icon } from "../Icon";
import { ICON_NAMES } from "./index";

export function IconShowcase() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Icon Library</h2>
        <p className="text-sm text-muted-foreground">Available icons from the unified PayEasy icon wrapper.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ICON_NAMES.map((name) => (
          <div
            key={name}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-3"
          >
            <Icon name={name} size="md" animate />
            <span className="text-center text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
