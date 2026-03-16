import ora, { type Color } from "ora";
import pc from "picocolors";

/** Get the ABC logo in ascii form */
export const getLogo = () => `
⣾${pc.dim("⢷")}⡾⢷${pc.dim("⡾")}⣷ 
⢿⡾${pc.dim("⢷⡾")}⢷⡿ `;

/** Create an ABC loading spinner */
export const spin = (
  text = "",
  {
    colour = "cyan",
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
  }: { colour?: Color; frames?: string[] } = {},
) => {
  const spinner = ora({
    color: colour,
    spinner: {
      frames,
      interval: 80,
    },
    text,
  });

  return spinner.start();
};
