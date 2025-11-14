import { Client, ActivityType } from 'discord.js';

export class BotStatus {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    setActivity(status: string, type: ActivityType = ActivityType.Streaming) {
        this.client.user?.setActivity(status, {type: type});
    }

    setPresence(status: 'online' | 'idle' | 'dnd' | 'invisible') {
        this.client.user?.setPresence({ status });
      }
    
      updateStatus(status: string, activityType: ActivityType = ActivityType.Watching) {
        this.setActivity(status, activityType);
        this.setPresence('online'); 
      }
}