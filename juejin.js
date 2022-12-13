"use strict"

/*---------------依赖-----------------*/
const nodeMailer = require('nodemailer');
const axios = require('axios');
const jwt = require('jsonwebtoken')
const Cron = require('cron').CronJob

/*---------------配置-----------------*/
const config = {
    "baseUrl": "https://api.juejin.cn",
    "baseUrl1": "https://juejin-game.bytedance.com/game/sea-gold/game/",
    "baseUrl2": "https://juejin-game.bytedance.com/game/sea-gold/home/",
    "apiUrl": {
        "getTodayStatus": "/growth_api/v1/get_today_status",
        "checkIn": "/growth_api/v1/check_in",
        "getLotteryConfig": "/growth_api/v1/lottery_config/get",
        "drawLottery": "/growth_api/v1/lottery/draw",
        'search': "search_api/v1/search"
    },
    // "uid": "2208289919867592",
    // "authorization": "",
    "uid": "1477386592325501",
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInNvdXJjZSI6Imp1ZWppbiJ9.eyJleHBpcmVBdCI6MTY2MDA0MzgzOSwidXNlcklkIjoiMTQ3NzM4NjU5MjMyNTUwMSIsImlhdCI6MTY1NzQ1MTgzOSwiZXhwIjoxNjYwMDQzODM5fQ.coHMbXfXAtlVrgILGjH7QsDltR5fPHpuIdEI1k8XqEvXkgN0x96i0gGY8bzstSeP3pqX8RAsDQMLv43kPFq1ZfYhmkO3XfaIS4lRVgFv742PhtrGLrD_YwiC8yQbphEbo3cv3b10XZqC9YQr1Xuro_HPBGZ2H9z28pRCMUR6EOMt4uh1D56M74ycj7wVFcSq66KMzk3wzkvjThqifDooaJZ4GTK8Khl5MyCM-MVsuMUFSiGqYNFIA3zuLv59XlEoQg7sqge5lsuw9QL2QhtueSZvr7iyeXg2XTCF48KnW_FXy-kKh-NViXwlus-Cfy3DqpqXAnH9yVcgbjxpyizXVQ",
    "cookie": "_ga=GA1.2.1416213126.1611024881; MONITOR_WEB_ID=ee398d14-c11a-4b69-a78b-5defaba05766; __tea_cookie_tokens_2608=%257B%2522user_unique_id%2522%253A%25226919299157028521484%2522%252C%2522web_id%2522%253A%25226919299157028521484%2522%252C%2522timestamp%2522%253A1641704373001%257D; _tea_utm_cache_2608={%22utm_source%22:%22bdpcjjqd00098%22%2C%22utm_medium%22:%22sem_baidu_jj_pc_dc01%22%2C%22utm_campaign%22:%22sembaidu%22}; _gid=GA1.2.406973206.1657451740; passport_csrf_token=019c189a331db2f23dc65a15ac85cbee; passport_csrf_token_default=019c189a331db2f23dc65a15ac85cbee; _tea_utm_cache_2018=undefined; n_mh=qSTAz0UlyYtmm-Hpu1ma3uR2ID2jECpA4NCRQY_zuos; passport_auth_status=af93190b03b05e701225c0697a23fdea%2C; passport_auth_status_ss=af93190b03b05e701225c0697a23fdea%2C; sid_guard=18b6aad62c251beea3a65337b942bf7a%7C1657451778%7C31536000%7CMon%2C+10-Jul-2023+11%3A16%3A18+GMT; uid_tt=fc992a2a8aa312b260f97a8627a5f3fc; uid_tt_ss=fc992a2a8aa312b260f97a8627a5f3fc; sid_tt=18b6aad62c251beea3a65337b942bf7a; sessionid=18b6aad62c251beea3a65337b942bf7a; sessionid_ss=18b6aad62c251beea3a65337b942bf7a; sid_ucp_v1=1.0.0-KGMwN2ZhODBhNWI4N2MzNmI5OThjNjhjZDQ5NWZkYmEzYTY1Y2RmYTYKFwj9nqD4zfXPAhCC6qqWBhiwFDgCQPEHGgJsZiIgMThiNmFhZDYyYzI1MWJlZWEzYTY1MzM3Yjk0MmJmN2E; ssid_ucp_v1=1.0.0-KGMwN2ZhODBhNWI4N2MzNmI5OThjNjhjZDQ5NWZkYmEzYTY1Y2RmYTYKFwj9nqD4zfXPAhCC6qqWBhiwFDgCQPEHGgJsZiIgMThiNmFhZDYyYzI1MWJlZWEzYTY1MzM3Yjk0MmJmN2E",
    "email": {
        "qq": {
            "user": "",
            "from": "",
            "to": "",
            "pass": ""
        }
    }
}

/*---------------掘金-----------------*/
/*---------------掘金-----------------*/

// let id = ''
// 签到
const checkIn = async () => {
  let {error, isCheck} = await getTodayCheckStatus();
  if (error) return console.log('查询签到失败');
  if (isCheck) return console.log('今日已参与签到');
  const {cookie, baseUrl, apiUrl} = config;
  let {data} = await axios({url: baseUrl + apiUrl.checkIn, method: 'post', headers: {Cookie: cookie}});
  if (data.err_no) {
      console.log('签到失败');
      await sendEmailFromQQ('今日掘金签到：失败', JSON.stringify(data));
  } else {
      console.log(`签到成功！当前积分：${data.data.sum_point}`);
      // await sendEmailFromQQ('今日掘金签到：成功', JSON.stringify(data));
  }
}

// 查询今日是否已经签到
const getTodayCheckStatus = async () => {
  const {cookie, baseUrl, apiUrl} = config;
  let {data} = await axios({url: baseUrl + apiUrl.getTodayStatus, method: 'get', headers: {Cookie: cookie}});
  if (data.err_no) {
      await sendEmailFromQQ('今日掘金签到查询：失败', JSON.stringify(data));
  }
  return {error: data.err_no !== 0, isCheck: data.data}
}
let loop = 0
// 查询首页的内容
const getHomeList = async () => { 
    const { cookie, baseUrl, apiUrl } = config;
    try {
      let { data } = await axios({
        url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed?aid=2608&uuid=7000206466557937182',
        // url: `${baseUrl}recommend_api/v1/article/recommend_all_feed?aid=2608&uuid=6919299157028521484`,
        method: 'POST',
        data: {
          client_type: 2608,
          cursor: "0",
          id_type: 2,
          limit: 20,
          sort_type: 200,
        },
        headers: { Cookie: cookie }
      });
      if (data.err_msg !== 'success') {
        await sendEmailFromQQ('查询首页失败', JSON.stringify(data));
        return
      }
      const columdIdList = data.data.map(item => item.item_info.article_id).filter(item => item)     
      await getColumnId(columdIdList[loop])
    } catch (err) {
      await sendEmailFromQQ('查询首页失败', JSON.stringify(err));
    }
  }
  
// 获取到column_id
const getColumnId = async (articleId) => {
    const { cookie, baseUrl, apiUrl } = config;
    let { data } = await axios({
      url: 'https://api.juejin.cn/content_api/v1/article/next_column_article?aid=2608&uuid=7000206466557937182',
      // url: `${baseUrl}recommend_api/v1/article/recommend_all_feed?aid=2608&uuid=6919299157028521484`,
      method: 'POST',
      data: {
        article_id: articleId
      },
      headers: { cookie: cookie }
    });
    if (!data.data.column_id) return 
    await detail(data.data.column_id)
    if(loop < 10){
        loop++;
        await getHomeList()
    }
  }
// 详情
const detail = async (columnId) => {
    const { cookie, baseUrl, apiUrl } = config;
    let { data } = await axios({
      url: 'https://api.juejin.cn/content_api/v1/column/detail?aid=2608&uuid=7000206466557937182&column_id=' + columnId,
      // url: `${baseUrl}recommend_api/v1/article/recommend_all_feed?aid=2608&uuid=6919299157028521484`,
      method: 'GET',
      headers: { cookie: cookie }
    });
    console.log(loop,'已成功浏览');
  }

// 抽奖
const draw = async () => {
  let {error, isDraw} = await getTodayDrawStatus();
  if (error) return console.log('查询抽奖次数失败');
  if (isDraw) return console.log('今日已无免费抽奖次数');
  const {cookie, baseUrl, apiUrl} = config;
  let {data} = await axios({url: baseUrl + apiUrl.drawLottery, method: 'post', headers: {Cookie: cookie}});
  if (data.err_no) return console.log('免费抽奖失败');
  console.log(`恭喜抽到：${data.data.lottery_name}`);
}

// 获取今天免费抽奖的次数
const getTodayDrawStatus = async () => {
  const {cookie, baseUrl, apiUrl} = config;
  let {data} = await axios({url: baseUrl + apiUrl.getLotteryConfig, method: 'get', headers: {Cookie: cookie}});
  if (data.err_no) {
      return {error: true, isDraw: false}
  } else {
      return {error: false, isDraw: data.data.free_count === 0}
  }
}

// 开始游戏
const handleclickStart =async () => {
  let res = await gameStart();
//   console.log('开始游戏的code',res.data.code);
  if(res.data.code === 4007){
      console.log('游戏已经开始,请先结束游戏获取gameid')
      await handleclickEnd(true)
  }else if(res.data.code === 0){
      // console.log("id",res.data.data.gameId);
      await handleclickComm(0,res.data.data.gameId)
  } else {
    // await handleclickEnd()
    await sendEmailFromQQ(`今日挖矿失败返回的code为${res.data.code}`);
  }
}
// 开始游戏的接口
const gameStart = async () => {
  let time = new Date().getTime();
  const {uid, baseUrl1, authorization} = config;
  return await axios({url: baseUrl1+`/start?uid=${uid}&time=${time}`,
      referrer: "https://juejin.cn/",
      referrerPolicy: "strict-origin-when-cross-origin",
      data: {"roleId":2},
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers:{
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: authorization,
          "content-type": "application/json;charset=UTF-8",
          "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-tt-gameid": "",
      }});
}


// 结束游戏
/**
*
* @param {*} isFirstOrEnd 是否是首次进入或者是奖励没拿满再次进入
*/
const handleclickEnd = async (isFirstOrEnd) => {
  let res = await gameEnd();
  // console.log(res);
  if(res.data.code === 0){
      console.log("游戏over，此次游戏矿石：" +
          res.data.data.gameDiamond +
          ",今日可获得矿石数量：" +
          res.data.data.todayLimitDiamond +
          ",已获取数量：" +
          res.data.data.todayDiamond);
  }else{
      console.log("结束未知状态码");
  }
  // 是否拿满了奖励
  let maxReward = res.data.data.todayLimitDiamond === res.data.data.todayDiamond
  if (isFirstOrEnd || !maxReward) {
      await resetMap()
      await handleclickStart()
  }
}

// 结束游戏的接口
const gameEnd = async () => {
  let time = new Date().getTime();
  const {uid, baseUrl1, authorization} = config;
  return await axios({url: baseUrl1+`/over?uid=${uid}&time=${time}`,
      referrer: "https://juejin.cn/",
      referrerPolicy: "strict-origin-when-cross-origin",
      data: {"roleId":2},
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers:{
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: authorization,
          "content-type": "application/json;charset=UTF-8",
          "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-tt-gameid": "",
      }});
}

// 获得的总矿石数量
let getMineral = 0
// 走
const  handleclickComm = async (i,id) => {
  //行动指令
  // request header 中的 authorization
  const {uid, baseUrl1, authorization} = config;
  let time = new Date().getTime();
  let gameid = await getgameid(id);
  // console.log("gameid第一次进来",gameid);

  // 0:开局往左 1:开局往右 2:中期 3:后期飞翔 4:后期扫荡
  let commandStep = i;
  // ····················自定义区域·END·····················

  let commandArr = [
      // 开局往左
      [
          {
              times: 2,
              command: ["2", "L", "D", "L", "4", "D", "6", "R", "D", "R"],
          },
      ],
      // 开局往右
      [
          {
              times: 2,
              command: ["2", "R", "D", "R", "6", "D", "4", "L", "D", "L"],
          },
      ],
      // 中期：赌万米
      [
          {
              times: 10,
              command: [
                  {
                      times: 2,
                      command: [
                          "D",
                          "2",
                          "L",
                          "D",
                          "L",
                          "4",
                          "D",
                          "6",
                          "U",
                          "L",
                          "D",
                          "R",
                      ],
                  },
                  "L",
                  "D",
              ],
          },
          { times: 2, command: ["U", "U", "8", "R"] },
          {
              times: 10,
              command: [
                  {
                      times: 2,
                      command: [
                          "D",
                          "2",
                          "R",
                          "D",
                          "R",
                          "6",
                          "D",
                          "4",
                          "U",
                          "R",
                          "D",
                          "L",
                      ],
                  },
                  "R",
                  "D",
              ],
          },
          { times: 2, command: ["U", "U", "8", "L"] },
      ],
      // 后期：万米飞翔
      [
          {
              times: 10,
              command: [
                  {
                      times: 2,
                      command: [
                          "D",
                          "2",
                          "L",
                          "D",
                          "L",
                          "4",
                          "D",
                          "6",
                          "U",
                          "L",
                          "D",
                          "R",
                      ],
                  },
                  "L",
                  "D",
              ],
          },
          { times: 2, command: ["U", "U", "8", "R"] },
          {
              times: 10,
              command: [
                  {
                      times: 2,
                      command: [
                          "D",
                          "2",
                          "R",
                          "D",
                          "R",
                          "6",
                          "D",
                          "4",
                          "U",
                          "R",
                          "D",
                          "L",
                      ],
                  },
                  "R",
                  "D",
              ],
          },
          { times: 2, command: ["U", "U", "8", "L"] },
      ],
      // 后期：无情扫荡
      [
          {
              times: 10,
              command: [
                  "L",
                  "L",
                  "L",
                  "4",
                  "L",
                  "L",
                  "L",
                  "4",
                  "D",
                  "R",
                  "R",
                  "R",
                  "6",
                  "R",
                  "R",
                  "R",
                  "6",
              ],
          },
          { times: 3, command: ["U", "U", "L", "L", "8", "4"] },
          {
              times: 6,
              command: ["D", "2", "L", "D", "L", "4", "D", "6", "U", "L", "D", "R"],
          },
          "L",
          "D",
          {
              times: 10,
              command: [
                  "R",
                  "R",
                  "R",
                  "6",
                  "R",
                  "R",
                  "R",
                  "6",
                  "D",
                  "L",
                  "L",
                  "L",
                  "4",
                  "L",
                  "L",
                  "L",
                  "4",
              ],
          },
          { times: 3, command: ["U", "U", "R", "R", "8", "6"] },
          {
              times: 6,
              command: ["D", "2", "R", "D", "R", "6", "D", "4", "U", "R", "D", "L"],
          },
          "R",
          "D",
      ],
  ];
  let coreCode = commandArr[commandStep];
  let loop = commandStep <= 1 ? 2 : 4; // 外层循环次数
  let params = { command: [] };
  let linshiyinyong = params;
  for (let i = 0; i < loop; i++) {
      linshiyinyong["command"].push({ times: 10, command: [] });
      linshiyinyong = linshiyinyong.command[0];
      if (i >= loop - 1) {
          linshiyinyong.command.push(...coreCode);
      }
  }
  linshiyinyong = null;
  let length = JSON.stringify(params).length;
  let res = await axios({url: baseUrl1+`/command?uid=${uid}&time=${time}`,
      method: "POST",
      credentials: "include",
      headers: {
          "Content-type": "application/json; charset=UTF-8",
          authorization: authorization,
          accept: "application/json, text/plain, */*",
          "content-length": length,
          "x-tt-gameid": gameid,
      },
      data: params,
  });
  // console.log('走的code',res.data.code);
  if (res.data.code === 0) {
      console.log("走路成功，可以继续走，当前游戏矿石" + res.data.data.gameDiamond);
  } else if (res.data.message.indexOf("不足") != -1) {
      console.log("代码块不足，换方式或者结束游戏");
  } else {
      console.log("走未知状态码");
  }
  // getMineral += res.data.data.gameDiamond
  // if(getMineral < 3000 && res.data.data.gameDiamond){
  //     await handleclickEnd(true)
  // }else{
      await handleclickEnd()
  // }
  // return await fetch(baseUrl1 + "/command?uid=" + uid + "&time=" + time, {
  //   method: "POST",
  //   credentials: "include",
  //   headers: {
  //     "Content-type": "application/json; charset=UTF-8",
  //     authorization: authorization,
  //     accept: "application/json, text/plain, */*",
  //     "content-length": length,
  //     "x-tt-gameid": gameid,
  //   },
  //   data: JSON.stringify(params),
  // }).then(async (res) => {
  //   res.json().then((ress) => {
  //     if (ress.code === 0) {
  //       alert("走路成功，可以继续走，当前游戏矿石" + ress.data.gameDiamond);
  //     } else if (ress.message.indexOf("不足") != -1) {
  //       alert("代码块不足，换方式或者结束游戏");
  //     } else {
  //       alert("未知状态码");
  //     }
  //     this.handleclickEnd()
  //   });
  // });
};

//获取gameId
const getgameid = (id) => {
  let time = new Date().getTime();
  let a = jwt.sign(
      {
          gameId: id,
          time: time,
      },
      "-----BEGIN EC PARAMETERS-----\nBggqhkjOPQMBBw==\n-----END EC PARAMETERS-----\n-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDB7KMVQd+eeKt7AwDMMUaT7DE3Sl0Mto3LEojnEkRiAoAoGCCqGSM49\nAwEHoUQDQgAEEkViJDU8lYJUenS6IxPlvFJtUCDNF0c/F/cX07KCweC4Q/nOKsoU\nnYJsb4O8lMqNXaI1j16OmXk9CkcQQXbzfg==\n-----END EC PRIVATE KEY-----\n",
      {
          algorithm: "ES256",
          expiresIn: 2592e3,
          header: {
              alg: "ES256",
              typ: "JWT",
          },
      }
  );
  console.log(a, "a");
  return a;
};
const resetMap= async () => {
  let time = new Date().getTime();
  const {uid, baseUrl1, authorization} = config;
  return await axios({url: baseUrl1+`/fresh_map?uid=${uid}&time=${time}`,
      referrer: "https://juejin.cn/",
      referrerPolicy: "strict-origin-when-cross-origin",
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers:{
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: authorization,
          "content-type": "application/json;charset=UTF-8",
          "sec-ch-ua":
              '" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-tt-gameid": "",
      }});
}
/*---------------邮件-----------------*/

// 通过qq邮箱发送
const sendEmailFromQQ = async (subject, html) => {
  let cfg = config.email.qq;
  if (!cfg || !cfg.user || !cfg.pass) return;
  const transporter = nodeMailer.createTransport({service: 'qq', auth: {user: cfg.user, pass: cfg.pass}});
  transporter.sendMail({
      from: cfg.from,
      to: cfg.to,
      subject: subject,
      html: html
  }, (err) => {
      if (err) return console.log(`发送邮件失败：${err}`, true);
      console.log('发送邮件成功')
  })
}

// const juejin = async (event, context) => {
//     await getHomeList()
//     console.log('开始');
//     await checkIn();
//     await draw();
//     console.log('结束');
//     await handleclickStart()

// };
// juejin()
let job = new Cron(
  '0 10 * * *',
  async () => {
    await getHomeList()
    console.log('开始');
    await checkIn();
    await draw();
    console.log('结束');
    await handleclickStart()
  },
  null,
  false
)

job.start()