import { spinner } from "@clack/prompts";
import pc from "picocolors";

/** Get the ABC logo in ascii form */
export const getLogo = () => `
⣾${pc.dim("⢷")}⡾⢷${pc.dim("⡾")}⣷ 
⢿⡾${pc.dim("⢷⡾")}⢷⡿ `;

/** Get the ABC logo with optional text on each line */
export const getHeader = (line1: string = "", line2: string = "") => {
  const logoLine1 = `⣾${pc.dim("⢷")}⡾⢷${pc.dim("⡾")}⣷`;
  const logoLine2 = `⢿⡾${pc.dim("⢷⡾")}⢷⡿`;

  return [
    "",
    `${pc.gray("│")}  ${logoLine1} ${line1}`,
    `${pc.gray("│")}  ${logoLine2} ${pc.bold(line2)}`,
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
