import { themeAttributes } from "@xsec/design-tokens";

export function parseTheme(theme) {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) throw new Error("conversation_tree_invalid_theme");
  const mode = theme["color-mode"], density = theme["ui-density"], motion = theme["reduce-motion"], size = theme["ui-font-size"];
  if (mode !== "light" && mode !== "dark") throw new Error("conversation_tree_invalid_theme_mode");
  if (density !== "compact" && density !== "comfortable") throw new Error("conversation_tree_invalid_theme_density");
  if (motion !== "true" && motion !== "false") throw new Error("conversation_tree_invalid_theme_motion");
  if (typeof size !== "string" || !/^\d+(?:\.\d+)?px$/.test(size)) throw new Error("conversation_tree_invalid_theme_font");
  const settings = { colorMode: mode, density, reducedMotion: motion === "true", fontScale: Number(size.slice(0, -2)) / 14, locale: "zh-CN" };
  themeAttributes(settings);
  return settings;
}

export function readInitialTheme() {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(["color-mode", "ui-density", "reduce-motion", "ui-font-size"].map(name => [name, style.getPropertyValue("--xsec-" + name).trim()]));
}
