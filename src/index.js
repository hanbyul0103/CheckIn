const config = require("../data/config.json");
const { Client, IntentsBitField } = require('discord.js');
const cron = require("node-cron");
const Holidays = require("date-holidays");

const hd = new Holidays("KR");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("ready", async () => {
    console.log("[!] login");

    cron.schedule("0 0 8 * * 1-5", async () => {
        const today = new Date();

        console.log(hd);

        if (hd.isHoliday(today)) {
            console.log("공휴일");
            return;
        }

        const month = today.getMonth() + 1;
        const day = today.getDate();

        const title = `${month}.${day} 출근`;
        const desc = "출근 인증하기";

        const thread = CreatePost(config.targetForumId, title, desc);
        console.log("출근 포럼 포스트 생성");
    });
});

async function CreatePost(targetForum, threadTitle, threadDescription) {
    const forumChannel = await client.channels.fetch(targetForum);

    const newThread = await forumChannel.threads.create({
        name: threadTitle,
        message: {
            content: threadDescription
        }
    });

    return newThread;
}

client.login(config.token);