const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

var currentWaifu = "misc";

client.on('ready', () => {
    if(!fs.existsSync("waifus")) {
        fs.mkdirSync("waifus");
    }
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Loving all my waifus");
    var channels = client.channels.array();
    for(var j = 0; j < channels.length; j++)
    {
        //if(channels[j].name.toLowerCase().includes("bot"))
        //    channels[j].send("Ohaiyo minna! <3");
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
    if(!message.startsWith("!")) {
        if(msg.attachments.array().length != 0)
            receivePicture(msg);
    }
    else if(message.startsWith("!help")) {
        help(msg);
    }
    else if(message.startsWith("!waifu")) {
        noWaifuNoLaifu(msg);
    }
    else if(message.startsWith("!list")) {
        listWaifus(msg);
    }
    else if(message.startsWith("!incoming ")) {
        changeIncomingMode(msg);
    }
    else if(message.startsWith("!current")) {
        msg.reply("I'm currently waiting for pictures of " + currentWaifu);
    }
    else {
        msg.reply("I didn't understand that command. If it was meant for another bot, my bad!");
    }
}

function help(msg) {
    msg.reply("The following commands are available:\n"
        + "*!help*: Displays this message\n"
        + "*!waifu*: I'll show you a waifu picture\n"
        + "*!waifu (name of waifu)*: I'll show you a picture of the waifu you specified\n"
        + "*!list*: I'll tell you all of the waifus I currently have pictures of\n"
        + "*!incoming (name of waifu)*: I prepare to receive a picture of the waifu with that name. If I receive any pictures, I will save it under the folder for that waifu\n"
        + "*!current*: I'll tell you the name of the waifu I'm currently waiting for");
}

function noWaifuNoLaifu(msg) {
    var chosenWaifu = getStringAfterSpace(msg.content.toLowerCase());
    if(chosenWaifu) {
        if(!fs.existsSync("waifus/" + chosenWaifu)) {
            msg.reply("I have no pictures of " + chosenWaifu + " D:\n"
                    + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
            currentWaifu = chosenWaifu;
            return;
        }
        var waifuPic = getRandomFileFromFolder("waifus/"+chosenWaifu);
    }
    else {
        chosenWaifu = getRandomFileFromFolder("waifus");
        var waifuPic = getRandomFileFromFolder("waifus/"+chosenWaifu);
    }
    msg.channel.send("", new Discord.Attachment("waifus/"+chosenWaifu+"/"+waifuPic));
}

function getStringAfterSpace(string) {
    if(string.indexOf(" ") > 0)
        return string.slice(string.indexOf(" ")+1, string.length);
    return null;
}

function getRandomFileFromFolder(folder) {
    var files = fs.readdirSync(folder);
    return files[getRandomInt(0, files.length-1)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function listWaifus(msg) {
    var files = fs.readdirSync("waifus");
    var waifuList = "Here are all of the waifus I currently have pictures of:\n";
    for(var i = 0; i < files.length; i++) {
        waifuList += (i+1) + ". " + files[i] + "\n"
    }
    msg.channel.send(waifuList);
}

function changeIncomingMode(msg) {
    var message = msg.content.toLowerCase();
    currentWaifu = getStringAfterSpace(message);
    msg.channel.send("Ready to receive pictures of " + currentWaifu);
}

function receivePicture(msg) {
    var attachments = msg.attachments.array();
    var filename_count = 0;
    for(var i=0; i < attachments.length; i++) {
        console.log("Downloading file " + attachments[i].filename);
        var filename = attachments[i].filename;
        if(!fs.existsSync("waifus/" + currentWaifu))
            fs.mkdirSync("waifus/" + currentWaifu);
        while(fs.existsSync("waifus/" + currentWaifu + "/" + filename)) {
            filename_count++;
            split_name = filename.split(".");
            filename = filename_count + "." + split_name[split_name.length-1];
        }
        console.log("Downloading it as " + "waifus/" + currentWaifu + "/" + filename);
        download(attachments[i].url, "waifus/"+currentWaifu+"/"+filename, function() {
            console.log("Done");
        });
    }
}

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

client.login('');