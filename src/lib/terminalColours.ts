import rawColours from "./colours.json" with { type: "json" };

/** Tuple representing RGB colour channels */
export type Colour = [number, number, number];

export interface ColorScheme {
  chars?: Colour[];
  startFg?: Colour;
  endFg?: Colour;
}

export const colours = rawColours.schemes as unknown as Record<
  string,
  ColorScheme
>;

/** Get the ANSI escape sequence for a 24-bit RGB colour */
export const rgbColour = (colour: Colour, { isBg = false } = {}): string => {
  const [r, g, b] = colour;
  return `\x1b[${isBg ? 48 : 38};2;${r};${g};${b}m`;
};

/** Scale down a colour by a ratio to dim it */
export const dimColour = (colour: Colour, ratio = 0.6): Colour => {
  return [
    Math.round(colour[0] * ratio),
    Math.round(colour[1] * ratio),
    Math.round(colour[2] * ratio),
  ];
};

/** Determine the foreground and background colour at a specific step in the gradient */
export const getColourAtStep = ({
  visibleIndex,
  width,
  scheme,
}: {
  visibleIndex: number;
  width: number;
  scheme: ColorScheme;
}): { fg: Colour; bg: Colour } => {
  const factor = width > 1 ? visibleIndex / (width - 1) : 0;

  if (scheme.chars) {
    // Map index 0 to first element, index 7 to last element, and others offset by 1
    const charIndex = Math.max(
      0,
      Math.min(
        scheme.chars.length - 1,
        visibleIndex === 0 ? 0 : visibleIndex === 7 ? 5 : visibleIndex - 1,
      ),
    );
    const fg = scheme.chars[charIndex] || ([0, 0, 0] as Colour);
    return {
      fg,
      bg: dimColour(fg, 0.15),
    };
  }

  const fg: Colour = [
    Math.round(
      (scheme.startFg?.[0] ?? 0) +
        factor * ((scheme.endFg?.[0] ?? 0) - (scheme.startFg?.[0] ?? 0)),
    ),
    Math.round(
      (scheme.startFg?.[1] ?? 0) +
        factor * ((scheme.endFg?.[1] ?? 0) - (scheme.startFg?.[1] ?? 0)),
    ),
    Math.round(
      (scheme.startFg?.[2] ?? 0) +
        factor * ((scheme.endFg?.[2] ?? 0) - (scheme.startFg?.[2] ?? 0)),
    ),
  ];

  return { fg, bg: dimColour(fg, 0.15) };
};

/**
 * Regular expression for matching ANSI escape codes.
 * Sourced from Sindre Sorhus's `ansi-regex` package.
 * @see https://github.com/chalk/ansi-regex
 */
const ansiRegex =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

/** Tokenize an ANSI-escaped string into individual characters and ANSI sequences */
const tokenizeLine = (text: string): string[] => {
  const tokens: string[] = [];
  let match;
  let lastIndex = 0;
  ansiRegex.lastIndex = 0;

  while ((match = ansiRegex.exec(text)) !== null) {
    const textSegment = text.slice(lastIndex, match.index);
    if (textSegment) {
      tokens.push(...[...textSegment]);
    }
    tokens.push(match[0]);
    lastIndex = ansiRegex.lastIndex;
  }
  const tail = text.slice(lastIndex);
  if (tail) {
    tokens.push(...[...tail]);
  }
  return tokens;
};

/** Helper to apply foreground and background gradients to text character-by-character across a fixed width */
export const applyGradientLine = (
  logoText: string,
  textPart: string,
  scheme: ColorScheme,
  dimmedIndices: number[],
  width = 80,
): string => {
  const fullLineText = textPart ? `${logoText} ${textPart}` : logoText;
  const tokens = tokenizeLine(fullLineText);

  const visibleCount = tokens.filter((t) => !ansiRegex.test(t)).length;
  if (visibleCount < width) {
    tokens.push(...Array(width - visibleCount).fill(" "));
  }

  let visibleIndex = 0;
  const rendered = tokens
    .map((token) => {
      if (ansiRegex.test(token)) {
        return token;
      }

      const { fg, bg } = getColourAtStep({ visibleIndex, width, scheme });
      const finalFg = dimmedIndices.includes(visibleIndex)
        ? dimColour(fg, 0.6)
        : fg;

      const fgCode = rgbColour(finalFg);
      const bgCode = rgbColour(bg, { isBg: true });

      visibleIndex++;
      return `${fgCode}${bgCode}${token}`;
    })
    .join("");

  return `${rendered}\x1b[0m`;
};
