import { Message } from "discord.js"
import { bot } from "../index";
import { db } from '../database-handler';
import { RowDataPacket } from "mysql2";

export const onMessageCreate = async (message: Message) => {
    if (message.author.bot) return;

    const [cb] = await db.query<RowDataPacket[]>('SELECT * FROM reactionchannels')
    if (!cb || cb.length === 0) return;
    for (const app of cb) {
        if (message.channelId === app.id) {
            try {
                await message.react(app.reaction1);
                await message.react(app.reaction2);
                if (app.thread) {
                    const thread = await message.startThread({
                        name: `Keskustelu: ${message.content.substring(0, 40)}`,
                        autoArchiveDuration: 60,
                        reason: 'Aloitettu botin toimesta!',
                    })
                }
            } catch (error) {
                console.error('Ongelma reaktio emojeiden luomisessa', error)
            }
        }
    }
}