"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerWrapper = void 0;
class PlayerWrapper {
    constructor(bot, player) {
        this.bot = bot;
        this.player = player;
        this.quitTimer = null;
    }
}
exports.PlayerWrapper = PlayerWrapper;
