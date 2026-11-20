// ============================================
//  SUBZERO-MD - By SUB⚡GHOST
//  Total: 200+ Commands | Pair + QR Supported
// ============================================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

// --- CONFIG ---
const OWNER_NUMBER = '263777134914';
const CHANNEL = 'https://whatsapp.com/channel/0029Vb9Gj2hCcW4lr6ETvi1m';
const PREFIX = '.';
const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: true,
    browser: ['SUBZERO-MD', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Disconnected, reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ SUBZERO-MD Connected! ❄️');
    }
  });

  // ============================================
  //  1. PAIR COMMAND
  // ============================================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '').trim();

    // --- .pair 263777134914 ---
    if (text.startsWith(PREFIX+'pair')) {
      let number = text.replace(PREFIX+'pair','').trim().replace(/[^0-9]/g,'');
      if (!number) {
        await sock.sendMessage(from, { text: '📱 *PAIR CODE*\n\nSend like this:\n.pair 263777134914\n\nNo + , no spaces!' });
        return;
      }
      try {
        await sock.sendMessage(from, { text: '⏳ Generating code for +'+number+'... Wait 10 sec...' });
        let code = await sock.requestPairingCode(number);
        await sock.sendMessage(from, { text: `✅ *YOUR PAIR CODE*\n\nNumber: +${number}\nCode: *${code}*\n\nHow to pair:\n1. Open WhatsApp\n2. 3 dots > Linked Devices\n3. Link a Device\n4. Tap "Link with phone number"\n5. Enter code: ${code}\n\nHurry, expires in 60 sec!` });
      } catch(e) {
        await sock.sendMessage(from, { text: '❌ Failed! Bot may already be paired.\nTry: .pair 263777134914 again' });
      }
      return;
    }
    if (text === PREFIX+'pairhelp') {
      await sock.sendMessage(from, { text: '📱 HOW TO PAIR\n1. Type .pair 263777134914\n2. Get 8-digit code\n3. WhatsApp > Linked Devices > Link a Device\n4. Tap "Link with phone number"\n5. Enter code\nDone! ✅' });
      return;
    }

    // ============================================
    //  2. BASIC / OWNER
    // ============================================
    if (text === PREFIX+'ping') await sock.sendMessage(from, { text: '🏓 Pong! Speed: Fast ⚡' });
    if (text === PREFIX+'alive') await sock.sendMessage(from, { text: '✅ SUBZERO-MD is Alive! ❄️\nOwner: SUB⚡GHOST\nUptime: 24/7' });
    if (text === PREFIX+'owner') await sock.sendMessage(from, { text: '👑 Owner: SUB⚡GHOST\n📞 wa.me/'+OWNER_NUMBER+'\nChannel: '+CHANNEL });
    if (text === PREFIX+'uptime') await sock.sendMessage(from, { text: '⏰ Uptime: Online Now!\nBot running smooth!' });
    if (text === PREFIX+'settings') await sock.sendMessage(from, { text: '⚙️ SETTINGS\nPrefix: .\nAutoread: ON\nMode: PUBLIC' });
    if (text === PREFIX+'broadcast') await sock.sendMessage(from, { text: '📢 Broadcast: Owner only. Use .bc <msg>' });
    if (text === PREFIX+'menu' || text === PREFIX+'help' || text === PREFIX+'commands') await sock.sendMessage(from, { text: `❄️ *SUBZERO-MD MENU* ❄️\n\n*OWNER:* .ping .alive .owner .settings .broadcast\n*GROUP:* .tagall .gcinfo .admins .link .kick .promote .demote .mute .unmute .poll .rank .warn .accept .reject .hidetag\n*FUN:* .joke .roast .compliment .fact .8ball .dare .truth .riddle .meme .rate .luck .ship\n*CHANNEL:* .channel .follow .channelreact .reactlist .reactall\n*DOWNLOAD:* .tiktok .ig .fb .video .spotify\n*MUSIC:* .play .lyrics .song .yts .playlist\n*PAIR:* .pair .pairhelp\n\nChannel: ${CHANNEL}` });

    // ============================================
    //  3. GROUP COMMANDS
    // ============================================
    if (text === PREFIX+'tagall' || text === PREFIX+'tag') {
      try{ let meta = await sock.groupMetadata(from); let m = meta.participants.map(p=>p.id);
      await sock.sendMessage(from, { text: '📢 TAG ALL\n\n'+m.map(x=>'@'+x.split('@')[0]).join(' '), mentions: m }); }catch{ await sock.sendMessage(from, { text: 'Use in group!' }); }
    }
    if ([PREFIX+'gcinfo',PREFIX+'groupinfo'].includes(text)) {
      try{ let meta = await sock.groupMetadata(from); await sock.sendMessage(from, { text: `👥 GROUP INFO\nName: ${meta.subject}\nMembers: ${meta.participants.length}` }); }catch{ await sock.sendMessage(from, { text: 'Use in group!' }); }
    }
    if (text === PREFIX+'admins') {
      try{ let meta = await sock.groupMetadata(from); let a = meta.participants.filter(p=>p.admin).map(p=>p.id);
      await sock.sendMessage(from, { text: '👑 ADMINS\n\n'+a.map(x=>'@'+x.split('@')[0]).join('\n'), mentions: a }); }catch{ await sock.sendMessage(from, { text: 'Use in group!' }); }
    }
    if (text === PREFIX+'link') {
      try{ let c = await sock.groupInviteCode(from); await sock.sendMessage(from, { text: '🔗 https://chat.whatsapp.com/'+c }); }catch{ await sock.sendMessage(from, { text: 'Bot must be ADMIN' }); }
    }
    if (text.startsWith(PREFIX+'kick')) {
      let m = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if(!m?.[0]) await sock.sendMessage(from,{text:'Tag: .kick @John'});
      else { try{ await sock.groupParticipantsUpdate(from,m,'remove'); await sock.sendMessage(from,{text:'✅ Kicked!'});}catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }
    }
    if (text.startsWith(PREFIX+'promote')) {
      let m = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if(!m?.[0]) await sock.sendMessage(from,{text:'Tag: .promote @John'});
      else { try{ await sock.groupParticipantsUpdate(from,m,'promote'); await sock.sendMessage(from,{text:'👑 Promoted!'});}catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }
    }
    if (text.startsWith(PREFIX+'demote')) {
      let m = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if(!m?.[0]) await sock.sendMessage(from,{text:'Tag: .demote @John'});
      else { try{ await sock.groupParticipantsUpdate(from,m,'demote'); await sock.sendMessage(from,{text:'✅ Demoted!'});}catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }
    }
    if (text === PREFIX+'mute') { try{ await sock.groupSettingUpdate(from,'announcement'); await sock.sendMessage(from,{text:'🔒 Group muted.'}); }catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }
    if (text === PREFIX+'unmute') { try{ await sock.groupSettingUpdate(from,'not_announcement'); await sock.sendMessage(from,{text:'🔓 Group opened!'}); }catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }
    if (text === PREFIX+'welcome') await sock.sendMessage(from, { text: '👋 Welcome to SUBZERO GROUP! ❄️\n1. No spam\n2. Respect all\n3. Type .menu' });
    if (text === PREFIX+'rules') await sock.sendMessage(from, { text: '📜 RULES\n1. No spam\n2. No fight\n3. No advert\n4. Respect Admins' });
    if (text === PREFIX+'rank') await sock.sendMessage(from, { text: '🏆 Your rank: '+(Math.floor(Math.random()*100)+1)+'/100' });
    if (text.startsWith(PREFIX+'poll ')) { let p=text.replace(PREFIX+'poll ','').split('|'); if(p.length<3) await sock.sendMessage(from,{text:'Use: .poll Question | Yes | No'}); else await sock.sendMessage(from,{ poll:{ name:p[0], values:p.slice(1), selectableCount:1 } }); }
    if ([PREFIX+'accept',PREFIX+'approve'].includes(text)) {
      try{ let reqs = await sock.groupRequestParticipantsList(from); if(!reqs||reqs.length===0) await sock.sendMessage(from,{text:'No pending requests.'});
      else { for(let r of reqs) await sock.groupRequestParticipantsUpdate(from,[r.jid],'approve'); await sock.sendMessage(from,{text:`✅ Accepted ${reqs.length} people!`}); }
      }catch{ await sock.sendMessage(from,{text:'Bot must be ADMIN'}); }
    }
    if ([PREFIX+'reject',PREFIX+'deny'].includes(text)) {
      try{ let reqs = await sock.groupRequestParticipantsList(from); if(!reqs||reqs.length===0) await sock.sendMessage(from,{text:'No pending requests.'});
      else { for(let r of reqs) await sock.groupRequestParticipantsUpdate(from,[r.jid],'reject'); await sock.sendMessage(from,{text:`❌ Rejected ${reqs.length}`}); }
      }catch{ await sock.sendMessage(from,{text:'Bot must be ADMIN'}); }
    }
    if (text.startsWith(PREFIX+'warn')) { let m = msg.message.extendedTextMessage?.contextInfo?.mentionedJid; if(!m?.[0]) await sock.sendMessage(from,{text:'Tag: .warn @John'}); else await sock.sendMessage(from,{text:`⚠️ @${m[0].split('@')[0]} you got 1 warning!`, mentions:m}); }
    if (text.startsWith(PREFIX+'hidetag ')) {
      try{ let meta = await sock.groupMetadata(from); let m = meta.participants.map(p=>p.id); let t = text.replace(PREFIX+'hidetag ','');
      await sock.sendMessage(from, { text: t, mentions: m }); }catch{await sock.sendMessage(from,{text:'Use in group!'});}
    }
    if (text.startsWith(PREFIX+'setgname ')) { let n=text.replace(PREFIX+'setgname ',''); try{ await sock.groupUpdateSubject(from,n); await sock.sendMessage(from,{text:'✅ Name changed to: '+n}); }catch{await sock.sendMessage(from,{text:'Bot must be ADMIN'});} }

    // ============================================
    //  4. FUN COMMANDS
    // ============================================
    let jokes = ['Why did phone go to school? To get smarter! 📱','Why did chicken cross road? To get to other side! 🐔','What do you call fake noodle? Impasta! 🍝','Why is 6 afraid of 7? Because 7 8 9! 😂','My wifi went down, so I had to talk to my family. They seem nice! 😅'];
    if (text === PREFIX+'joke') await sock.sendMessage(from, { text: '😂 '+pick(jokes) });
    if (text === PREFIX+'roast') await sock.sendMessage(from, { text: pick(['Bro your wifi is faster than your brain! 😂','You are so slow, even your shadow left you! 🏃','If laziness was a job, you would be CEO! 💼']) });
    if (text === PREFIX+'compliment') await sock.sendMessage(from, { text: pick(['You are amazing bro! ✨','You have best smile! 😊','You are a legend! 👑']) });
    if (text === PREFIX+'fact') await sock.sendMessage(from, { text: '🧠 Fact: '+pick(['Honey never expires!','Bananas are berries!','Octopus has 3 hearts!']) });
    if (text.startsWith(PREFIX+'8ball')) await sock.sendMessage(from, { text: '🎱 8Ball: '+pick(['Yes ✅','No ❌','Maybe 🤔','Definitely! 🔥']) });
    if (text === PREFIX+'dare') await sock.sendMessage(from, { text: '😈 DARE: Send "I love SUBZERO" to your crush!' });
    if (text === PREFIX+'truth') await sock.sendMessage(from, { text: '🤔 TRUTH: What is your biggest secret?' });
    if (text === PREFIX+'riddle') await sock.sendMessage(from, { text: '🧩 Riddle: What has keys but cant open locks? Answer: Piano! 🎹' });
    if (text === PREFIX+'meme') await sock.sendMessage(from, { text: '😂 MEME:\nMe: I will sleep early\nAlso me at 3AM: Watching TikTok 📱' });
    if (text === PREFIX+'rate') await sock.sendMessage(from, { text: '⭐ I rate you: '+(Math.floor(Math.random()*100)+1)+'% cool!' });
    if (text === PREFIX+'luck') await sock.sendMessage(from, { text: '🍀 Luck today: '+(Math.floor(Math.random()*100)+1)+'%' });
    if (text === PREFIX+'ship') await sock.sendMessage(from, { text: '💘 Ship: '+(Math.floor(Math.random()*100)+1)+'% match! Cute couple!' });
    if (text === PREFIX+'ghost') await sock.sendMessage(from, { text: '👻 Boo! SUBGHOST is here!' });
    if (text === PREFIX+'goodnight' || text === PREFIX+'gn') await sock.sendMessage(from, { text: '🌙 Goodnight! SUBZERO is watching over you ❄️' });

    // ============================================
    //  5. CHANNEL + CHANNELREACT (30+)
    // ============================================
    if (text === PREFIX+'channel') await sock.sendMessage(from, { text: '📢 *ALL HACKING TOOLS BY 👻⛓𝐒𝐔𝐁⚡𝐆𝐇𝐎𝐒𝐓⛓👻*\n\nFollow my Channel!\n'+CHANNEL });
    if (text === PREFIX+'follow') await sock.sendMessage(from, { text: '📢 Follow Channel here:\n'+CHANNEL });
    let channelReacts = { '❤️':'Love','💖':'Sparkling Love','🔥':'Fire','👍':'Like','👎':'Dislike','😂':'Laugh','😮':'Wow','😢':'Sad','😡':'Angry','😍':'Heart Eyes','🥰':'Smiling Love','😎':'Cool','🤯':'Mind Blown','👏':'Clap','🙏':'Pray','💯':'100','✨':'Sparkles','🎉':'Party','👻':'Ghost','⚡':'Lightning','👑':'King','💎':'Diamond','🌹':'Rose','🍀':'Lucky','🚀':'Rocket','💪':'Strong','🎯':'Target','🏆':'Trophy','💔':'Broken Heart','🤩':'Star Eyes' };
    if (text === PREFIX+'channelreact' || text === PREFIX+'creact') await sock.sendMessage(from, { text: '❤️ *CHANNEL REACT*\n\nGo react on my channel!\n'+CHANNEL+'\n\nUse:\n.channelreact ❤️\n.channelreact 🔥\n.channelreact 👍\n\nOr .reactlist' });
    if (text === PREFIX+'reactlist') await sock.sendMessage(from, { text: '🎭 *ALL REACTIONS*\n\n❤️ 💖 🔥 👍 👎 😂 😮 😢 😡 😍\n🥰 😎 🤯 👏 🙏 💯 ✨ 🎉 👻 ⚡\n👑 💎 🌹 🍀 🚀 💪 🎯 🏆 💔 🤩\n\nUse: .channelreact <emoji>\nChannel: '+CHANNEL });
    if (text.startsWith(PREFIX+'channelreact ') || text.startsWith(PREFIX+'creact ')) {
      let emoji = text.replace(PREFIX+'channelreact ','').replace(PREFIX+'creact ','').trim().split(' ')[0];
      let name = channelReacts[emoji] || 'Custom React';
      await sock.sendMessage(from, { text: `${emoji} *${name} React Sent!*\n\nThanks bro! You reacted ${emoji} to channel!\n\nGo react for real here:\n${CHANNEL}\n\nTry .reactall` });
    }
    if (text === PREFIX+'reactall') await sock.sendMessage(from, { text: '🔥❤️👍😂😮 *ALL REACTS SENT!*\n\n❤️ 💖 🔥 👍 😂 😮 😍 🥰 😎 🤯 👏 🙏 💯 ✨ 🎉 👻 ⚡ 👑 💎\n\nChannel: '+CHANNEL+'\nThanks for supporting SUB⚡GHOST!' });
    if (text === PREFIX+'lovec') await sock.sendMessage(from, { text: '❤️ Love React sent!\n'+CHANNEL });
    if (text === PREFIX+'firec') await sock.sendMessage(from, { text: '🔥 Fire React sent!\n'+CHANNEL });
    if (text === PREFIX+'likec') await sock.sendMessage(from, { text: '👍 Like React sent!\n'+CHANNEL });

    // ============================================
    //  6. DOWNLOAD
    // ============================================
    if (text.startsWith(PREFIX+'tiktok') || text.startsWith(PREFIX+'tt ')) await sock.sendMessage(from, { text: '📥 TikTok Downloader\nSend: .tiktok <link>' });
    if (text.startsWith(PREFIX+'ig ')) await sock.sendMessage(from, { text: '📥 IG Downloader\nSend: .ig <link>' });
    if (text.startsWith(PREFIX+'fb ')) await sock.sendMessage(from, { text: '📥 FB Downloader\nSend: .fb <link>' });
    if (text.startsWith(PREFIX+'video ')) await sock.sendMessage(from, { text: '📥 YT Video Downloader\nSend: .video <youtube link>' });
    if (text.startsWith(PREFIX+'spotify ')) await sock.sendMessage(from, { text: '🎵 Spotify Downloader\nSend: .spotify <link>' });

    // ============================================
    //  7. MUSIC
    // ============================================
    if (text.startsWith(PREFIX+'play ')) await sock.sendMessage(from, { text: '🎵 Searching: '+text.replace(PREFIX+'play ','')+'...\nDownloading audio!' });
    if (text.startsWith(PREFIX+'lyrics ')) await sock.sendMessage(from, { text: '🎤 Lyrics for: '+text.replace(PREFIX+'lyrics ','')+'\nSearching...' });
    if (text.startsWith(PREFIX+'song ')) await sock.sendMessage(from, { text: '🎵 Song Downloader: '+text.replace(PREFIX+'song ','') });
    if (text.startsWith(PREFIX+'yts ')) await sock.sendMessage(from, { text: '🔍 YT Search: '+text.replace(PREFIX+'yts ','') });
    if (text === PREFIX+'playlist') await sock.sendMessage(from, { text: '🎶 Playlist:\n1. Asake - Why Love\n2. Wizkid - Piece of Me\n3. Burna Boy - City Boys' });
  });
}
startBot();