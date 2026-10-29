/** #RRGGBB (or #RGB) -> rgba() string, for tinting a surface toward an accent. */
export function hexToRgba(hex: string, alpha: number): string {
  let value = hex.replace("#", "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
