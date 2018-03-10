const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

var waifuDir = "waifus";
var scoreFile = "waifu-scores.txt";
var lastVoteFile = "last-votes.txt";
var currentWaifu = "misc";
var waifuScores = []
var votes = []
var lastVote = []

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
    if(!fs.existsSync(scoreFile)) {
        var files = fs.readdirSync(waifuDir);
        for(var i = 0; i < files.length; i++) {
            waifuScores[files[i]] = 1;
        }
        backupScores();
    }
    else {
        var fileText = fs.readFileSync(scoreFile).toString();
        console.log("FILE TEXT: " + fileText);
        var lines = fileText.split("\n");
        console.log("LINES: " + lines);
        for(var i = 0; i < lines.length; i++) {
            console.log("LINE + " + i + ": " + lines[i]);
            if(lines[i].length == 0)
                break;
            var waifu = lines[i].slice(0, lines[i].lastIndexOf(" "));
            var score = lines[i].slice(lines[i].lastIndexOf(" ")+1, lines[i].length);
            waifuScores[waifu] = score;
        }
    }
    
    if(fs.existsSync(lastVoteFile)) {
        var fileText = fs.readFileSync(lastVoteFile).toString();
        var lines = fileText.split("\n");
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].length == 0)
                break;
            var splitLine = lines[i].split(" ");
            var userId = splitLine[0];
            var voteDay = splitLine[1];
            var numVotes = splitLine[2];
            lastVote[userId] = voteDay;
            votes[userId] = numVotes;
        }
    }
}

function backupScores() {
    var fileText = "";
    for(waifu in waifuScores) {
        fileText += waifu + " " + waifuScores[waifu] + "\r\n";
    }
    fs.writeFileSync(scoreFile, fileText);
    
    fileText = "";
    for(vote in lastVote) {
        if(!votes[vote])
            votes[vote] = 0;
        fileText += vote + " " + lastVote[vote] + " " + votes[vote] + "\r\n";
    }
    fs.writeFileSync(lastVoteFile, fileText);
}

client.on('message', msg => {
    if(msg.channel.name && !(msg.channel.name.toLowerCase().includes("bot")))
        return;
    if(msg.author.username == "waifu-bot")
        return;
    if(!msg.channel.name)
        console.log("Message received from " + msg.author.username + ": " + msg.content);
    
    var message = msg.content.toLowerCase();
    
    if(message === "waifu-bot, die")
    {
        setTimeout(function () {
            msg.reply("D:");
            setTimeout(function () {
                throw 'Goodbye cruel world';
            }, 1000);
        }, 1000);
    }
    
    reactToCommands(msg, message);
});

function reactToCommands(msg, message)
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
        var waifuDisplay = getCapitalizedName(currentWaifu);
        msg.reply("I'm currently waiting for pictures of " + waifuDisplay);
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
            var waifuDisplay = getCapitalizedName(chosenWaifu);
            msg.reply("I have no pictures of " + waifuDisplay + " D:\n"
                    + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
            currentWaifu = chosenWaifu;
            return;
        }
    }
    else {
        var totalVotes = getTotalVotes();
        console.log("Total votes: " + totalVotes);
        var index = getRandomInt(1, totalVotes);
        console.log("Index: " + index);
        chosenWaifu = getWaifuFromScoreIndex(index);
    }
    var waifuDisplay = getCapitalizedName(chosenWaifu);
    sendWaifuPicWithMessage(msg, waifuDisplay, chosenWaifu);
}

function sendWaifuPicWithMessage(msg, message, waifu) {
    console.log("MESSAGE");
    console.log(message);
    console.log("AND THEN WAIFU");
    console.log(waifu);
    var waifuPic = getRandomFileFromFolder(waifuDir+"/"+waifu);
    msg.channel.send(message, new Discord.Attachment(waifuDir+"/"+waifu+"/"+waifuPic));
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
        votes += parseInt(waifuScores[waifu]);
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
        var waifuDisplay = getCapitalizedName(files[i]);
        waifuList += (i+1) + ". " + waifuDisplay + "\n"
    }
    msg.channel.send(waifuList);
}

function changeIncomingMode(msg) {
    var message = msg.content.toLowerCase();
    requestedWaifu = getStringAfterSpace(message);
    
    if(requestedWaifu.indexOf('.') > -1 || requestedWaifu.indexOf('\\') > -1 || requestedWaifu.indexOf('/') > -1 || requestedWaifu.indexOf(':') > -1 || requestedWaifu.indexOf('*') > -1 || requestedWaifu.indexOf('?') > -1 || requestedWaifu.indexOf('\"') > -1 || requestedWaifu.indexOf('<') > -1 || requestedWaifu.indexOf('>') > -1 || requestedWaifu.indexOf('|') > -1) {
        msg.reply("I see what you're doing there. Nice try. You can't have a ., /, \\, :, ?, \", <, >, or | in your waifu name.");
        return;
    }
    
    currentWaifu = requestedWaifu;
    var waifuDisplay = getCapitalizedName(currentWaifu);
    msg.channel.send("Ready to receive pictures of " + waifuDisplay);
}

function receivePicture(msg) {
    var attachments = msg.attachments.array();
    var filename_count = 0;
    for(var i=0; i < attachments.length; i++) {
        var filename = attachments[i].filename;
        split_name = filename.split(".");
        var filetype = split_name[split_name.length-1];
        if(filetype != "jpg" && filetype != "jpeg" && filetype != "gif" && filetype != "png") {
            console.log("Got sketchy file: " + filename);
            msg.reply("I only accept jpg, png, and gif files! Pls no viruses");
            return;
        }
        
        console.log("Downloading file " + filename);
        var filename = attachments[i].filename;
        if(!fs.existsSync(waifuDir+"/" + currentWaifu)) {
            fs.mkdirSync(waifuDir+"/" + currentWaifu);
            waifuScores[currentWaifu] = 1;
        }
        while(fs.existsSync(waifuDir+"/" + currentWaifu + "/" + filename)) {
            filename_count++;
            filename = filename_count + "." + filetype;
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
    var userId = msg.author.id;
    var date = new Date();
    if(!votes[userId] || (lastVote[userId] && date.getDate() != lastVote[userId]))
        votes[userId] = 0;
    if(votes[userId] >= 5) {
        msg.reply("You've already used up all your daily votes! You only get 5 votes per day. Come back tomorrow to votes again.");
        return;
    }
    
    var message = msg.content.toLowerCase();
    var bestGirl = getStringAfterSpace(message);
    
    if(!fs.existsSync(waifuDir + "/" + bestGirl)) {
        var bestGirlDisplay = getCapitalizedName(bestGirl);
        msg.reply("I have no pictures of " + bestGirlDisplay + " D:\n"
                + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
        currentWaifu = bestGirl;
        return;
    }
    
    waifuScores[bestGirl]++;
    votes[userId]++;
    lastVote[userId] = date.getDate();
    backupScores();
    var bestGirlDisplay = getCapitalizedName(bestGirl);
    msg.reply("Vote cast for " + bestGirlDisplay + ". They are now at " + waifuScores[bestGirl] + " points!");
}

function whoIsBest(msg) {
    var bestGirls = getRankedGirlList();
    
    var girlRankings = "Best girls are:\n";
    for(var i = 0; i < bestGirls.length; i++) {
        var girlName = getCapitalizedName(bestGirls[i][0]);
        girlRankings += (i+1) + ". " + girlName + ": " + bestGirls[i][1] + "\n";
        console.log("girl " + girlName + " ranking: " + bestGirls[i][1]);
    }
    sendWaifuPicWithMessage(msg, girlRankings, bestGirls[0][0]);
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

function getCapitalizedName(name) {
    var splitName = name.split(" ");
    var fixedName = ""
    for(var i = 0; i < splitName.length; i++) {
        fixedName += getCapitalizedString(splitName[i]) + " ";
    }
    
    return fixedName.trim();
}

function getCapitalizedString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var key = fs.readFileSync("key.txt");
client.login(key.toString());