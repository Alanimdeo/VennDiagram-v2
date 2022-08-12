import {
  Client,
  ClientOptions,
  Collection,
  ChatInputCommandInteraction,
  Interaction,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import { Player } from "./modules/player";

export class Bot extends Client {
  player: Player;
  commands: Collection<string, Command<ChatInputCommandInteraction>>;
  adminCommands: Collection<string, Command<Message>>;
  consoleCommands: Collection<string, Command<string[]>>;
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

export type CommandExecutable<T = ChatInputCommandInteraction | Message | string[]> = (
  input: T,
  bot: Bot
) => Promise<any>;

export class Command<T = ChatInputCommandInteraction | Message | string[]> {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: CommandExecutable<T>;

  constructor(data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">, execute: CommandExecutable<T>) {
    this.data = data;
    this.execute = execute;
  }
}
