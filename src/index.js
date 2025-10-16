const config = require("../data/config.json");
const { Client, IntentsBitField } = require("discord.js");
const cron = require("node-cron"); // 스케쥴러
const Holidays = require("date-holidays"); // 명절 가져오는 npm 패키지

const hd = new Holidays("KR"); // 지역 설정

const client = new Client({ // 봇 권한 열기 (인텐트 설정)
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// === 포스트 이름 / 메시지 / 태그 / 역할 정보 ===
const threadInfo = {
    wakeup: {
        name: "기상",
        message: "기상 인증하기",
        tagId: "1428198240096096266",   // 기상~! 태그
        roleId: "1428143575438331944",  // @일어나세요 용사여
    },
    work: {
        name: "출근",
        message: "출근 인증하기",
        tagId: "1428198264058150953",   // 출근~! 태그
        roleId: "1387581206949920933",  // @현장실습생
    },
};

// === 스케줄 설정 ===
const scheduleTest = "1 * * * * *"; // 테스트용 cron
const schedule = "0 0 8 * * 1-5";   // 이게 진짜임

client.on("ready", async () => { // ready가 불리면 / 봇이 켜지면
    console.log("[!] 봇 로그인 완료"); // 로그인 확인

    // 스케줄 등록
    cron.schedule(scheduleTest, async () => {
        await handleDailyPosts(); // 포스트 생성
    });
});

// === 매일 포스트 생성 함수 ===
async function handleDailyPosts() {
    const today = new Date(); // Date 객체 뽑아오기
    const month = today.getMonth() + 1; // getMonth() 는 0~11, +1 해주기
    const day = today.getDate(); // 날짜 가져오기

    // 공휴일이면 포스트 생성하지 않음
    if (hd.isHoliday(today)) {
        console.log("오늘은 공휴일입니다. 포스트 생성을 건너뜁니다.");
        return;
    }

    const { wakeup, work } = threadInfo;

    // 기상 인증 포스트 생성
    await createPost(config.targetForumId, `${month}.${day} ${wakeup.name}`, `<@&${wakeup.roleId}> ${wakeup.message}`, wakeup.tagId);

    // 출근 인증 포스트 생성
    await createPost(config.targetForumId, `${month}.${day} ${work.name}`, `<@&${work.roleId}> ${work.message}`, work.tagId);

    console.log(`[${month}.${day}] 포스트 생성 완료`);
}

// === 포스트 생성 함수 ===
async function createPost(targetForum, threadName, threadMessage, tag) {
    const forumChannel = client.channels.cache.get(targetForum) // 캐시 우선
        ?? await client.channels.fetch(targetForum); // 없으면 fetch

    // 실제 채널 찾는 작업 필요
    const newThread = await forumChannel.threads.create({ // 포럼에 만드는 Post는 Thread
        name: threadName,
        message: {
            content: threadMessage
        },
        appliedTags: [tag] // 태그 적용
    });

    return newThread; // 새로 만든 thread 객체 반환
}

client.login(config.token); // 로그인