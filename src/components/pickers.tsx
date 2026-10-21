import { Select } from "./ui";
import type { ComponentProps } from "react";
type Opt = { id: number; name: string; active?: boolean; type?: string; unit?: string };
export function Pick({ options, placeholder = "Select…", ...p }: ComponentProps<"select"> & { options: Opt[]; placeholder?: string }) {
  return (
    <Select {...p}>
      <option value="">{placeholder}</option>
      {options.filter((o) => o.active !== false).map((o) => <option key={o.id} value={o.id}>{o.name}{o.type ? ` (${o.type})` : ""}{o.unit ? ` · ${o.unit}` : ""}</option>)}
    </Select>
  );
}
