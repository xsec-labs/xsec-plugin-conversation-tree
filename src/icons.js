import { svgElement } from "./elements.js";

const ICON_PATHS = {
  branch: ["M7 4v9", "M17 4v3a5 5 0 0 1-5 5H9", "M9.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z", "M7 13v2.5"],
  chevronRight: ["M9 6l6 6-6 6"],
  info: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", "M12 11v5", "M12 7.5v.01"],
  minus: ["M5 12h14"],
  plus: ["M12 5v14", "M5 12h14"],
  refresh: ["M20 11a8 8 0 0 0-14.3-4.3L4 8.5", "M4 4v4.5h4.5", "M4 13a8 8 0 0 0 14.3 4.3l1.7-1.8", "M20 20v-4.5h-4.5"],
  search: ["M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z", "M20 20l-4.5-4.5"],
  tree: ["M9 5.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z", "M3.5 18.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z", "M15.5 18.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z", "M11.5 8v3", "M6 16v-2a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v2"],
};

export function icon(name, size = 16) {
  const svg = svgElement("svg", {
    "aria-hidden": "true",
    fill: "none",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    "stroke-width": 1.75,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  for (const d of ICON_PATHS[name] ?? []) svg.append(svgElement("path", { d }));
  return svg;
}
