const config = require("../data/config.json");
const { Client, IntentsBitField } = require('discord.js');
const cron = require("node-cron"); // 스케쥴러
const Holidays = require("date-holidays"); // 명절 가져오는 npm 패키지

const hd = new Holidays("KR"); // 지역 설정

const client = new Client({ // 봇 권한 열기 (인텐츠 설정)
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("ready", async () => { // ready가 불리면 / 봇이 켜지면
    console.log("[!] login"); // 그냥 로그인 확인

    cron.schedule("0 0 8 * * 1-5", async () => { // 스케쥴 등록 "0(초) 0(분) 8(시) *(매일) *(매월) 1-5(월~금요일 1 == 월, 2 == 화)"
        const today = new Date(); // Date 객체 뽑아오기

        console.log(hd); // 제대로 생성됐는지 확인

        if (hd.isHoliday(today)) { // 공휴일이면
            console.log("공휴일");
            return;
        }

        const month = today.getMonth() + 1; // getMonth() 는 0~11, 그래서 +1 해주기
        const day = today.getDate(); // 얜 제대로 가져와짐;;

        const title = `${month}.${day} 출근`; // 10.2 출근 < 요 텍스트 만듦
        const desc = "출근 인증하기"; // 포스트 첫 채팅

        const thread = CreatePost(config.targetForumId, title, desc);
        console.log("출근 포럼 포스트 생성");
    });
});

async function CreatePost(targetForum, threadTitle, threadDescription) {
    const forumChannel = await client.channels.fetch(targetForum);  // config 파일에서 forum의 id를 문자열로 가져오고 있기 때문에
                                                                    // 실제 채널 찾는 작업이 필요함
    const newThread = await forumChannel.threads.create({ // 포럼에 만드는 Post는 실제로 Thread라고 함
        name: threadTitle,
        message: {
            content: threadDescription
        }
    });

    return newThread; // 새로 만든 thread 객체 발싸
}

client.login(config.token); // 로그인