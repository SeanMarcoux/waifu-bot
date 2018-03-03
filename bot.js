const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

var waifuDir = "waifus";
var currentWaifu = "misc";
var waifuScores = []

client.on('ready', () => {
    if(!fs.existsSync(waifuDir)) {
        fs.mkdirSync(waifuDir);
    }
    initializeWaifuScores();
    
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Loving all my waifus");
    var channels = client.channels.array();
    for(var j = 0; j < channels.length; j++)
    {
        //if(channels[j].name.toLowerCase().includes("bot"))
        //    channels[j].send("Ohaiyo minna! <3");
    }
});

function initializeWaifuScores() {
    var files = fs.readdirSync(waifuDir);
    for(var i = 0; i < files.length; i++) {
        waifuScores[files[i]] = 1;
    }
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
    else if(message.startsWith("!bestgirl ")) {
        voteForBestGirl(msg);
    }
    else if(message.startsWith("!whoisbest")) {
        whoIsBest(msg);
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
        + "*!current*: I'll tell you the name of the waifu I'm currently waiting for\n"
        + "*!bestgirl (name of waifu)*: This will cast a vote for the specified girl as Best Girl\n"
        + "*!whoisbest*: I'll give you the current ranking of the waifus based on your votes");
}

function noWaifuNoLaifu(msg) {
    var chosenWaifu = getStringAfterSpace(msg.content.toLowerCase());
    if(chosenWaifu) {
        if(!fs.existsSync(waifuDir + "/" + chosenWaifu)) {
            msg.reply("I have no pictures of " + chosenWaifu + " D:\n"
                    + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
            currentWaifu = chosenWaifu;
            return;
        }
        var waifuPic = getRandomFileFromFolder(waifuDir+"/"+chosenWaifu);
    }
    else {
        var totalVotes = getTotalVotes();
        var index = getRandomInt(1, totalVotes);
        chosenWaifu = getWaifuFromScoreIndex(index);
        var waifuPic = getRandomFileFromFolder(waifuDir+"/"+chosenWaifu);
    }
    msg.channel.send("", new Discord.Attachment(waifuDir+"/"+chosenWaifu+"/"+waifuPic));
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

function getTotalVotes() {
    var votes = 0;
    for(var waifu in waifuScores) {
        votes += waifuScores[waifu];
    }
    return votes;
}

function getWaifuFromScoreIndex(index) {
    var bestGirls = getRankedGirlList();
    for(var i=0; i < bestGirls.length; i++) {
        index -= bestGirls[i][1];
        if(index <= 0)
            return bestGirls[i][0];
    }
    return bestGirls[bestGirls.length-1][0];
}

function listWaifus(msg) {
    var files = fs.readdirSync(waifuDir);
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
        if(!fs.existsSync(waifuDir+"/" + currentWaifu)) {
            fs.mkdirSync(waifuDir+"/" + currentWaifu);
            waifuScores[currentWaifu] = 1;
        }
        while(fs.existsSync(waifuDir+"/" + currentWaifu + "/" + filename)) {
            filename_count++;
            split_name = filename.split(".");
            filename = filename_count + "." + split_name[split_name.length-1];
        }
        console.log("Downloading it as " + waifuDir + "/" + currentWaifu + "/" + filename);
        download(attachments[i].url, waifuDir+"/"+currentWaifu+"/"+filename, function() {
            console.log("Done");
        });
    }
}

function download(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

function voteForBestGirl(msg) {
    var message = msg.content.toLowerCase();
    var bestGirl = getStringAfterSpace(message);
    
    if(!fs.existsSync(waifuDir + "/" + bestGirl)) {
        msg.reply("I have no pictures of " + bestGirl + " D:\n"
                + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
        currentWaifu = bestGirl;
        return;
    }
    
    waifuScores[bestGirl]++;
    msg.reply("Vote cast for " + bestGirl + ". They are now at " + waifuScores[bestGirl] + " points!");
}

function whoIsBest(msg) {
    var bestGirls = getRankedGirlList();
    
    var girlRankings = "Best girls are:\n";
    for(var i = 0; i < bestGirls.length; i++) {
        girlRankings += (i+1) + ". " + bestGirls[i][0] + ": " + bestGirls[i][1] + "\n";
    }
    msg.channel.send(girlRankings);
}

function getRankedGirlList() {
    var bestGirls = Object.keys(waifuScores).map(function(key) {
        return [key, waifuScores[key]];
    });

    // Sort the array based on the second element
    bestGirls.sort(function(first, second) {
        return second[1] - first[1];
    });
    return bestGirls;
}


var key = fs.readFileSync("key.txt");
client.login(key.toString());