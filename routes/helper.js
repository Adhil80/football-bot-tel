const puppeteer = require('puppeteer');
let fs = require('fs')
let gis = require('g-i-s')


function replaceAll(key, value, string) {
    const search = key;
    const replaceWith = value;
    const result = string.split(search).join(replaceWith);
    return result
}

module.exports = {
    fetchMatch: async (league, then) => {
        const browser = await puppeteer.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
          });
        const page = await browser.newPage();
        await page.emulateTimezone('Asia/Kolkata')
        await page.goto('https://www.google.com/search?q=' + league);
        console.log('page opened');
        await page.waitForSelector('.SwsxUd').then(async (e) => {
            e.click()

            setTimeout(() => {
                page.$$('.KAIX8d').then(async (matches) => {
                    let i = 0
                    let todayMatches = []
                    async function fetchMatches() {


                        let onMatchfetched = async () => {
                            i = i + 1
                            if (matches[i] != null) {
                                fetchMatches()
                            } else {
                                console.log(__dirname);
                                fs.writeFileSync(__dirname+'/database/'+league+'match.json', JSON.stringify(todayMatches))
                                then({msg:'Done'})
                                await browser.close();
                            }
                        }



                        const match = matches[i];
                        let value = await page.evaluate(el => el.innerText, match)
                        if (value.includes('Today') | value.includes('Tomorrow')) {
                            if (value.includes('\n') && !value.includes('FT')) {
                                let cMatch = replaceAll('\n\n\n', '', replaceAll('\t', '', value)).split('\n')


                                gis(cMatch[3] + ' vs ' + cMatch[4] + ' today football squawka', (err, results) => {
                                    console.log(results[0]);
                                    if (results[0].url.endsWith('.png') | results[0].url.endsWith('.jpg')) {
                                        todayMatches.push({ date: cMatch[0], time: cMatch[1], team_a: cMatch[3], team_b: cMatch[4], img: results[0].url, league })
                                    }else if(results[1].url.endsWith('.png') | results[1].url.endsWith('.jpg')){
                                        todayMatches.push({ date: cMatch[0], time: cMatch[1], team_a: cMatch[3], team_b: cMatch[4], img: results[1].url, league })
                                    }else if(results[3].url.endsWith('.png') | results[3].url.endsWith('.jpg')){
                                        todayMatches.push({ date: cMatch[0], time: cMatch[1], team_a: cMatch[3], team_b: cMatch[4], img: results[4].url, league })
                                    }
                                    onMatchfetched()
                                })

                            } else {
                                onMatchfetched()
                            }
                        } else {
                            onMatchfetched()
                        }


                    }
                    fetchMatches()



                })
            }, 3000)

        })



    },
    getAllMatches: (then)=>{
        let returnData = []
        let leagues = ['La Liga', 'Premier League', 'Serie A', 'Bundesliga', 'Champions League', 'Ligue 1', 'Eredivisie']
        for (let i = 0; i < leagues.length; i++) {
            const league = leagues[i]+'match.json';
            let datas = JSON.parse(fs.readFileSync(__dirname+'/database/'+league,'utf8'))
            for (let j = 0; j < datas.length; j++) {
                returnData.push(datas[j])
            }
            
        }
        then(returnData)
    },
    sendTeleMessage:(bot,message,chatId,then)=>{
        bot.sendMessage(chatId, message).then((m) => {
            then(m.message_id)
            console.log(message);
        })
    },
   

}