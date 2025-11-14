import { Bot} from "./bot";
import { config } from "./config";
import dotenv from 'dotenv';
dotenv.config();
import "./database-handler";
import express from 'express';
export const bot = new Bot();
bot.start(config.TOKEN)

const checkRole = async (discordId: any) => {
    const guild = await bot.client.guilds.fetch(config.GUILD);
    const member = await guild.members.fetch(discordId);
    return member && member.roles.cache.has(config.WHITELISTROLE);
};

const app = express();
const port = 30121;

app.get('/check-role/:discordId', async (req, res) => {
    const discordId = req.params.discordId;

    try {
        const hasRole = await checkRole(discordId);
        res.json({ hasRole });
    } catch (error: any) {
    if (error.code === 10007) {
        res.json({ hasRole: false, error: 'not_in_guild' });
    } else {
        res.status(500).json({ error: 'internal_error' });
    }
}
});

app.listen(port, () => {
    console.log(`Roolin chekkaus servu: http://127.0.0.1:${port}`);
});


