const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Loving all my waifus");
    var channels = client.channels.array();
    for(var j = 0; j < channels.length; j++)
    {
        if(channels[j].name.toLowerCase().includes("bot"))
            channels[j].send("Ohaiyo minna! <3");
    }
});

function sendDm(dmChannel, message)
{
    dmChannel.send(message);
}

client.on('message', msg => {
    if(msg.channel.name && !(msg.channel.name.toLowerCase().includes("bot")))
        return;
    if(msg.author.username == "waifu-bot")
        return;
    var message = msg.content.toLowerCase();
    reactToBS(msg, message);
    
    if(message === "waifu-bot, die")
    {
        setTimeout(function () {
            msg.reply("D:");
            setTimeout(function () {
                throw 'Goodbye cruel world';
            }, 1000);
        }, 1000);
    }
});

function reactToBS(msg, message)
{
    if(message.includes("waifu")) {
        noWaifuNoLaifu(msg);
    }
}

function noWaifuNoLaifu(msg) {
    var attachments = msg.attachments.array();
    if(attachments.length == 0) {
        var files = fs.readdirSync("waifus");
        var waifuPic = files[getRandomInt(0, files.length-1)];
        msg.channel.send("", new Discord.Attachment("waifus/"+waifuPic));
    }
    else {
        var filename_count = 0;
        for(var i=0; i < attachments.length; i++) {
            console.log("Downloading file " + attachments[i].filename);
            var filename = attachments[i].filename;
            while(fs.existsSync("waifus/"+filename)) {
                filename_count++;
                split_name = filename.split(".");
                filename = filename_count + "." + split_name[split_name.length-1];
            }
            console.log("Downloading it as " + filename);
            download(attachments[i].url, "waifus/"+filename, function() {
                console.log("Done");
            });
        }
    }
}

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.login('');