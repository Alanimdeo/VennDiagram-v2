import {
  Client,
  ClientOptions,
  Collection,
  ChatInputCommandInteraction,
  Interaction,
  Message,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { Manager } from "moonlink.js";
import { PlayerWrapper } from "./modules/player";

export interface Config {
  token: string;
  adminPrefix: string;
  admins: string[];
  idleTimeout: number;
  lavalink: LavalinkConfig;
}

export interface LavalinkConfig {
  host: string;
  port: number;
  password: string;
  secure: boolean;
}

export class Bot extends Client {
  commands: Collection<string, Command<ChatInputCommandInteraction>>;
  adminCommands: Collection<string, Command<Message>>;
  consoleCommands: Collection<string, Command<string[]>>;
  lastInteraction: Interaction | null;
  manager: Manager;
  players: Collection<string, PlayerWrapper>;

  constructor(clientOptions: ClientOptions, manager: Manager) {
    super(clientOptions);
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, Command>();
    this.consoleCommands = new Collection<string, Command>();
    this.lastInteraction = null;
    this.manager = manager;
    this.players = new Collection<string, PlayerWrapper>();
  }
}

export type CommandExecutable<
  T = ChatInputCommandInteraction | Message | string[],
> = (input: T, bot: Bot) => Promise<any>;

export class Command<T = ChatInputCommandInteraction | Message | string[]> {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: CommandExecutable<T>;

  constructor(
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    execute: CommandExecutable<T>
  ) {
    this.data = data;
    this.execute = execute;
  }
}
