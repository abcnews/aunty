import ora, { type Color } from "ora";
import pc from "picocolors";

export const getLogo = () => `
⣾${pc.dim("⢷")}⡾⢷${pc.dim("⡾")}⣷ 
⢿⡾${pc.dim("⢷⡾")}⢷⡿ `;

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
