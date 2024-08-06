import fs from "fs";
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
import { Player } from "./modules/player";
import ytdl from "@distube/ytdl-core";

export interface Config {
  token: string;
  adminPrefix: string;
  admins: string[];
  cookiesPath?: string;
}

export class Bot extends Client {
  player: Player;
  commands: Collection<string, Command<ChatInputCommandInteraction>>;
  adminCommands: Collection<string, Command<Message>>;
  consoleCommands: Collection<string, Command<string[]>>;
  lastInteraction: Interaction | null;
  ytdlAgent: ytdl.Agent;

  constructor(clientOptions: ClientOptions, cookies?: ytdl.Cookie[]) {
    super(clientOptions);
    this.player = new Player();
    this.commands = new Collection<string, Command>();
    this.adminCommands = new Collection<string, Command>();
    this.consoleCommands = new Collection<string, Command>();
    this.lastInteraction = null;
    this.ytdlAgent = ytdl.createAgent(cookies);
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
