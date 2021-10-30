var express = require('express');
var router = express.Router();
var puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const token = '2070988803:AAHtmFA3xVhQp2BGEHx4nJ-KVICaMnwk1Jg';
const bot = new TelegramBot(token, { polling: true });
const { fetchMatch, getAllMatches, sendTeleMessage } = require('./helper');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  const message = msg.text.replace('@football_world_news_bot', '')
  console.log(message);
  switch (message) {
    case '/update3zF9329880':

      let leagues = ['La Liga', 'Premier League', 'Serie A', 'Bundesliga', 'Champions League', 'Ligue 1', 'Eredivisie']
      i = 0
      let msgid = ''
      sendTeleMessage(bot, 'Updating laliga', chatId, (id) => {
        msgid = id;
      })


      function fetchLeagues() {

        fetchMatch(leagues[i], (a) => {
          i = i + 1
          if (leagues[i] != null) {
            if (msgid != '') {
              bot.editMessageText('Updating ' + leagues[i], { chat_id: chatId, message_id: msgid })
            }
            fetchLeagues()
          } else {
            if (msgid != '') {
              getAllMatches((mathes)=>{
                writeFileSync(__dirname+'/database/matches.json',JSON.stringify(mathes))
                bot.editMessageText('Updation compleated', { chat_id: chatId, message_id: msgid })
              })
            }
          }
        })
      }
      fetchLeagues()

      break;

    case '/matches':
      getAllMatches((matches) => {

        matches.forEach((match, index) => {
          setTimeout(() => {
            bot.sendPhoto(chatId, match.img, { caption: `${match.team_a} vs ${match.team_b}\n${match.date} ${match.time}\n${match.league}` }).catch((e) => { console.log(match.img); sendTeleMessage(bot, e.message, chatId, () => { }) })
          }, 500 * (index + 1))
        });

      })
      break
    case "/wh_matches":
      getAllMatches((matches) => {
        let i = 0
        let match = matches[i]

        let onMatchSend = () => {
          i = i + 1
          if (matches[i] != null) {
            match = matches[i]
            setTimeout(() => {
              sendMatch()
            }, 500)
          }
        }
        let sendMatch = () => {
          sendImage(match.img, `*${match.team_a} vs ${match.team_b}* . *${match.date} at ${match.time}* in *${match.league}*`
            , () => {
              onMatchSend()
            })
        }

        sendMatch()

      })
      break
    default:
      bot.sendMessage(chatId, 'Hi there')

      break;
  }



  // send a message to the chat acknowledging receipt of their message
});
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

async function start(teamA,teamB) {
  let brs = await puppeteer.launch({ headless: false })
  let page = await brs.newPage()
  await page.goto(`https://www.google.com/search?q=${teamA}+vs+${teamB}`)
  let dashBoard = await page.waitForSelector('#sports-app > div > div.imso-hov.imso-mh > div:nth-child(2) > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov')
  dashBoard.click()
  let timeBoard = await page.waitForXPath('//*[@id="liveresults-sports-immersive__match-fullpage"]/div/div/div[4]/div[1]/div[2]/div/div/div/div[1]/div[1]/div/div/span/span/span/span[1]')
  let aTeamScoreBoard = await page.waitForXPath('//*[@id="liveresults-sports-immersive__match-fullpage"]/div/div/div[4]/div[1]/div[2]/div/div/div/div[1]/div[2]/div[1]/div/div[2]/div/div/div[1]')
  let bTeamScoreBoard = await page.waitForXPath('//*[@id="liveresults-sports-immersive__match-fullpage"]/div/div/div[4]/div[1]/div[2]/div/div/div/div[1]/div[2]/div[1]/div/div[2]/div/div/div[3]')
  setInterval(async ()=>{
    let time = await page.evaluate(el => el.textContent, timeBoard)
    let aTeamScore = await page.evaluate(el => el.textContent, aTeamScoreBoard)
    let bTeamScore = await page.evaluate(el => el.textContent, bTeamScoreBoard)
    console.log(time, aTeamScore, bTeamScore);
  },1000*60)

}


var http = require("http");
setInterval(function () {
  http.get("http://football-bot-tel.herokuapp.com");
}, 1680000);

module.exports = router;
