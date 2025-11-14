"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotStatus = void 0;
const discord_js_1 = require("discord.js");
class BotStatus {
    client;
    constructor(client) {
        this.client = client;
    }
    setActivity(status, type = discord_js_1.ActivityType.Streaming) {
        this.client.user?.setActivity(status, { type: type });
    }
    setPresence(status) {
        this.client.user?.setPresence({ status });
    }
    updateStatus(status, activityType = discord_js_1.ActivityType.Watching) {
        this.setActivity(status, activityType);
        this.setPresence('online');
    }
}
exports.BotStatus = BotStatus;
