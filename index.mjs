import wa from '@open-wa/wa-automate';
import { decryptMedia } from '@open-wa/wa-decrypt';
import fetch from "node-fetch";

wa.create().then(client => start(client))

function start(client) {
  client.onMessage(async message => {
    if(message.body === '/bisaapa') {
      await client.sendText(message.from, 'Saya bisa: \n\n- /siapasaya\n- /fotosaya\n- /jadwalsholat\n- /meme\n- /sticker\n\n *Udah Itu Doang*\n\n_minta pembuat gua kalo pengen lebih_');  
    }
    if (message.body === '/siapasaya') {
      if(message.sender.pushname === ''){
        await client.sendText(message.from, 'Ibunya kasih nama bagus bagus, nggak dipake');  
      }
      else{
        let nameKind = [
          'Namamu Budi biasa dipanggil ',
          'Masa nama sendiri nggak tahu? @',
          'Cari di google, '
        ]
        await client.sendText(message.from, nameKind[Math.floor(Math.random() * nameKind.length)] + message.sender.pushname);
      }
    }
    if (message.body === '/fotosaya') {
      await client.sendImage(message.from, message.sender.profilePicThumbObj.eurl, 'profile.jpeg', 'Agak Burik Ya Mukanya :v')
    }
    if (message.body === '/meme') {
      let meme = await fetch("https://meme-api.herokuapp.com/gimme").then(res => res.json()).catch(err => console.log(err))
      await client.sendImage(message.from, meme.preview[3], 'meme.jpeg', `${meme.title} *by ${meme.author}*`)
    }
    if (message.body === '/sticker') {
      await client.sendText(message.from, 'Kirim gambar dengan caption\n*/sticker*')
    }
    if(message.type === 'image') {
      if(message.text.indexOf('/sticker') > -1 && message.text.indexOf('/sticker') < 1){
        let mediaData = await decryptMedia(message);
        await client.sendImageAsSticker(message.from, `data:${message.mimetype};base64,${mediaData.toString('base64')}`, {author: "SpongeTron", pack: "Dibuat BOT", keepScale: true})
      }
      else if(message.text.indexOf('/sticker') >= 1){
        await client.sendText(message.from, 'Kirim gambar dengan caption\n*/sticker*')
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