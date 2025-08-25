import { Player } from "moonlink.js";
import { Bot } from "../types";

export class PlayerWrapper {
  bot: Bot;
  player: Player;
  quitTimer: ReturnType<typeof setTimeout> | null;

  constructor(bot: Bot, player: Player) {
    this.bot = bot;
    this.player = player;
    this.quitTimer = null;
  }
}
