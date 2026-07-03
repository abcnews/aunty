import { spinner } from "@clack/prompts";
import pc from "picocolors";
import { colours, applyGradientLine } from "./terminalColours.ts";

/** Get the ABC logo with a custom foreground/background gradient */
export const getGradientLogo = (
  colour: keyof typeof colours = "rainbow",
): { line1: string; line2: string } => {
  const hasColor = pc.isColorSupported;
  const hasTrueColor =
    hasColor &&
    (process.env.COLORTERM === "truecolor" ||
      process.env.COLORTERM === "24bit");

  if (!hasTrueColor) {
    return {
      line1: " ⣾⢷⡾⢷⡾⣷ ",
      line2: " ⢿⡾⢷⡾⢷⡿ ",
    };
  }

  const scheme = colours[colour] || colours.rainbow;
  return {
    line1: applyGradientLine(" ⣾⢷⡾⢷⡾⣷ ", "", scheme, [2, 5], 8),
    line2: applyGradientLine(" ⢿⡾⢷⡾⢷⡿ ", "", scheme, [3, 4], 8),
  };
};

/** Get the ABC logo with optional text on each line */
export const getHeader = (
  line1 = "",
  line2 = "",
  options: string | { prepend?: string; colour?: keyof typeof colours } = {},
) => {
  const prepend =
    typeof options === "string"
      ? options
      : (options.prepend ?? `${pc.gray("│")}`);
  const colour = (
    typeof options === "string" ? "rainbow" : (options.colour ?? "rainbow")
  ) as keyof typeof colours;
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

/** Print all available header colors for dev testing */
export const printDevColors = () => {
  Object.keys(colours).forEach((colour) => {
    if (colour === "commands") return;
    console.log(`\n--- ${colour.toUpperCase()} ---`);
    console.log(
      getHeader("aunty", `dev-mode (${colour})`, {
        colour: colour as keyof typeof colours,
      }),
    );
  });
};
