import wa from '@open-wa/wa-automate';
import { decryptMedia } from '@open-wa/wa-decrypt';
import got from 'got';
import translate from "translate";
import fetch from "node-fetch";

let commands = ['/bisaapa', '/meme', '/sticker', '/jadwalsholat', '/tanya', '/katabijak', '/enid', '/iden']
wa.create().then(client => start(client))
function start(client) {
  client.onMessage(async message => {
    if(message.body.indexOf('/') === 0) {
      let command = message.text.split(' ')
      if(commands.indexOf(command[0]) == -1){
        await client.sendText(message.from, `Command *${command[0]}* tidak ada.\nKetik /bisaapa.`);  
      }
    }
    if(message.body === '/bisaapa') {
      await client.sendText(message.from, 'Saya bisa: \n\n- /tanya\n- /meme\n- /katabijak\n- /iden\n- /enid\n- /sticker\n- /jadwalsholat\n\n *Udah Itu Doang*\n\n_minta pembuat gua kalo pengen lebih_');  
    }
    if(message.text.indexOf('/tanya') > -1 && message.text.indexOf('/tanya') < 1){
      let ask = message.text.split('/tanya')
      if(ask.length < 2){
        await client.sendText(message.from, 'Kirim /tanya *pertanyaan*')
      }
      else{
        const prompt = `Q:${ask[1]}?\n`;
        (async () => {
          const url = 'https://api.openai.com/v1/engines/davinci/completions';
          const params = {
            "prompt": prompt,
            "stop": "Q:",
            "max_tokens": 100,
            "temperature": 0.5,
            "top_p": 0.5,
          };
          const headers = {
            'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
          };

          try {
            const response = await got.post(url, { json: params, headers: headers }).json();
            let output = `${response.choices[0].text}`;
            let answer = output.split('A:')
            await client.sendText(message.from, answer[1])
          } catch (err) {
            console.log(err);
          }
        })();
      }
    }
    if (message.body === '/meme') {
      let meme = await fetch("https://meme-api.herokuapp.com/gimme").then(res => res.json()).catch(err => console.log(err))
      await client.sendImage(message.from, meme.preview[3], 'meme.jpeg', `${meme.title} *by ${meme.author}*`)
    }
    if (message.body === '/katabijak') {
      let quote = await fetch("https://free-quotes-api.herokuapp.com/").then(res => res.json()).catch(err => console.log(err))
      let kata = await translate(quote.quote, "id");
      await client.sendText(message.from, `_${kata}_\n\n${quote.author === "" ? '' : `*~ ${quote.author}*`}`)
    }
    if (message.text.indexOf('/enid') > -1 && message.text.indexOf('/enid') < 1) {
      let ask = message.text.split('/enid')
      if(ask.length < 2){
        await client.sendText(message.from, 'Kirim /enid *kata*')
      }
      else{
        translate.from = "en";
        let kata = await translate(ask[1], "id");
        await client.sendText(message.from, `${kata}`)
      }
    }
    if (message.text.indexOf('/iden') > -1 && message.text.indexOf('/iden') < 1) {
      let ask = message.text.split('/iden')
      if(ask.length < 2){
        await client.sendText(message.from, 'Kirim /iden *kata*')
      }
      else{
        translate.from = "id";
        let kata = await translate(ask[1], "en");
        await client.sendText(message.from, `${kata}`)
      }
    }
    if (message.body === '/sticker') {
      await client.sendText(message.from, 'Kirim gambar dengan caption\n*/sticker*')
    }
    if(message.type === 'image') {
      if(message.text.indexOf('/sticker') > -1 && message.text.indexOf('/sticker') < 1){
        let mediaData = await decryptMedia(message);
        await client.sendImageAsSticker(message.from, `data:${message.mimetype};base64,${mediaData.toString('base64')}`, {author: "SpongeTron", pack: "Dibuat BOT", keepScale: true})
      }
    }
    if (message.body.indexOf('/jadwalsholat') > -1 && message.body.indexOf('/jadwalsholat') < 1) {
      if(message.body.split(' ').length != 2){
        await client.sendText(message.from, 'Kirim /jadwalsholat *namakota*')
      }
      else{
        let city = message.body.split(' ')[1].toLowerCase()
        await fetch(`https://api.pray.zone/v2/times/today.json?city=${city}`).then(
          async (res) => {
            if(res.ok){
              let schedule = await res.json()
              await client.sendText(message.from, `Lokasi : ${schedule.results.location.city}\n\nTanggal : ${schedule.results.datetime[0].date.gregorian.split("-").reverse().join("-")}\n\n*Jadwal :*\n - Subuh : ${schedule.results.datetime[0].times.Fajr}\n - Dzuhur : ${schedule.results.datetime[0].times.Dhuhr}\n - Ashar : ${schedule.results.datetime[0].times.Asr}\n - Maghrib : ${schedule.results.datetime[0].times.Maghrib}\n - Isya : ${schedule.results.datetime[0].times.Isha}`)
            }
            else{
              client.sendText(message.from, `Kota ${city} tidak terdaftar`)
            }
          }
        )
      }
    }
  });
}

