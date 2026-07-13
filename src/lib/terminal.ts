import { spinner } from "@clack/prompts";
import pc from "picocolors";

const getColorFn = (colourName: string): ((str: string) => string) => {
  switch (colourName) {
    case "blue":
      return pc.blue;
    case "green":
      return pc.green;
    case "magenta":
      return pc.magenta;
    case "yellow":
      return pc.yellow;
    case "cyan":
      return pc.cyan;
    case "red":
      return pc.red;
    default:
      return pc.dim;
  }
};

const styleLogoLine = (
  text: string,
  colourName: string,
  dimmedIndices: number[],
): string => {
  const rainbowColors = [pc.red, pc.yellow, pc.green, pc.cyan, pc.blue, pc.magenta];
  const isRainbow = colourName === "rainbow";
  const singleColorFn = isRainbow ? null : getColorFn(colourName);
  let rainbowIndex = 0;

  return [...text]
    .map((char, index) => {
      if (char === " ") return char;
      const colorFn = isRainbow
        ? rainbowColors[rainbowIndex++ % rainbowColors.length]
        : singleColorFn!;
      const colored = colorFn(char);
      return dimmedIndices.includes(index) ? pc.dim(colored) : colored;
    })
    .join("");
};

/** Get the ABC logo styled with native terminal colours */
export const getGradientLogo = (
  colour = "rainbow",
): { line1: string; line2: string } => {
  return {
    line1: styleLogoLine(" ⣾⢷⡾⢷⡾⣷ ", colour, [2, 5]),
    line2: styleLogoLine(" ⢿⡾⢷⡾⢷⡿ ", colour, [3, 4]),
  };
};

/** Get the ABC logo with optional text on each line */
export const getHeader = (
  line1 = "",
  line2 = "",
  options: string | { prepend?: string; colour?: string } = {},
) => {
  const prepend =
    typeof options === "string"
      ? options
      : (options.prepend ?? `${pc.gray("│")}`);
  const colour =
    typeof options === "string" ? "rainbow" : (options.colour ?? "rainbow");
  const { line1: logoLine1, line2: logoLine2 } = getGradientLogo(colour);

  return [
    "",
    `${prepend}${logoLine1} ${line1}`,
    `${prepend}${logoLine2} ${pc.bold(line2)}`,
  ].join("\n");
};

/** Create an ABC loading spinner using clack's spinner */
export const spin = (
  text = "",
  frames = [
    "⣏⠀⠀",
    "⡟⠀⠀",
    "⠟⠄⠀",
    "⠛⡄⠀",
    "⠙⣄⠀",
    "⠘⣤⠀",
    "⠐⣤⠂",
    "⠀⣤⠃",
    "⠀⣠⠋",
    "⠀⢠⠛",
    "⠀⠠⠻",
    "⠀⠀⢻",
    "⠀⠀⣹",
    "⠀⠀⣼",
    "⠀⠐⣴",
    "⠀⠘⣤",
    "⠀⠙⣄",
    "⠀⠛⡄",
    "⠠⠛⠄",
    "⢠⠛⠀",
    "⣠⠋⠀",
    "⣤⠃⠀",
    "⣦⠂⠀",
    "⣧⠀⠀",
  ],
) => {
  const s = spinner({ frames });
  s.start(text);
  return s;
};

/** Print all available header colours for dev testing */
export const printDevColours = () => {
  const testColours = [
    "rainbow",
    "blue",
    "green",
    "cyan",
    "yellow",
    "magenta",
    "red",
  ];
  testColours.forEach((colour) => {
    console.log(`\n--- ${colour.toUpperCase()} ---`);
    console.log(
      getHeader("aunty", `dev-mode (${colour})`, {
        colour,
      }),
    );
  });
};
