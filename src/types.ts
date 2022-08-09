import { Client, ClientOptions, Collection, Interaction, SlashCommandBuilder } from "discord.js";
import { Player } from "./modules/player";

export class Bot extends Client {
  player: Player;
  commands: Collection<string, Command>;
  adminCommands: Collection<string, Command>;
  consoleCommands: Collection<string, Command>;
  lastInteraction: Interaction | null;

  constructor(clientOptions: ClientOptions) {
    super(clientOptions);
    this.player = new Player();
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, Command>();
    this.consoleCommands = new Collection<string, Command>();
    this.lastInteraction = null;
  }
}

export class Command {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: Function;

  constructor(data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">, execute: Function) {
    this.data = data;
    this.execute = execute;
  }
}
