import { Client, ClientOptions, Collection, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Player } from "./modules/player";

export class Bot extends Client {
    player: Player;
    commands: Collection<string, Command>;
    adminCommands: Collection<string, Command>;

    constructor(clientOptions: ClientOptions) {
        super(clientOptions);
        this.player = new Player();
        this.commands = new Collection<string, Command>();
        this.adminCommands = new Collection<string, Command>();
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
