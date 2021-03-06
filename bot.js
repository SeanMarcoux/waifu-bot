const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

var waifuDir = "waifus";
var waifuMode = true;
var scoreFile = "waifu-scores.txt";
var lastVoteFile = "last-votes.txt";
var husbundoDir = "husbundos";
var husbundoScoreFile = "husbundo-scores.txt";
var husbundoLastVoteFile = "husbundo-last-votes.txt";
var currentWaifu = "misc";
var waifuScores = []
var votes = []
var lastVote = []
var currentHusbundo = "misc";
var husbundoScores = []
var husbundoVotes = []
var husbundoLastVote = []
var miscTimer;
var dailyTimer;

client.on('ready', () => {
    if(!fs.existsSync(waifuDir)) {
        fs.mkdirSync(waifuDir);
    }
    initializeWaifuScores();
    
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Loving all my waifus");
    
    startDailyTimer();
});

function startDailyTimer()
{
    var millis = getMillisTilMidnight();
    dailyTimer = setTimeout(postDaily, millis);
}

function getMillisTilMidnight() {
    var midnight = new Date();
    midnight.setHours( 24 );
    midnight.setMinutes( 0 );
    midnight.setSeconds( 0 );
    midnight.setMilliseconds( 0 );
    var currentTime = new Date().getTime();
    return (midnight.getTime() - currentTime);
}

function postDaily()
{
    postDailyWaifu();
    postDailyHusbundo();
    startDailyTimer();
}

function postDailyWaifu()
{
    var chosenWaifu = getRandomVotedWaifu();
    var waifuDisplay = getCapitalizedName(chosenWaifu);
    var waifuPic = getRandomFileFromFolder(waifuDir+"/"+chosenWaifu);
    
    var channels = client.channels.array();
    for(var j = 0; j < channels.length; j++)
    {
        if(channels[j].name && channels[j].name.toLowerCase().includes("bot"))
        {
            channels[j].send("The waifu of the day today is " + waifuDisplay, new Discord.Attachment(waifuDir+"/"+chosenWaifu+"/"+waifuPic));
        }
    }
}

function postDailyHusbundo()
{
    var chosenHusbundo = getRandomVotedHusbundo();
    var husbundoDisplay = getCapitalizedName(chosenHusbundo);
    var husbundoPic = getRandomFileFromFolder(husbundoDir+"/"+chosenHusbundo);
    
    var channels = client.channels.array();
    for(var j = 0; j < channels.length; j++)
    {
        if(channels[j].name && channels[j].name.toLowerCase().includes("bot"))
        {
            channels[j].send("The husbundo of the day today is " + husbundoDisplay, new Discord.Attachment(husbundoDir+"/"+chosenHusbundo+"/"+husbundoPic));
        }
    }
}

function initializeWaifuScores() {
    //Waifu scores
    if(!fs.existsSync(scoreFile)) {
        var files = fs.readdirSync(waifuDir);
        for(var i = 0; i < files.length; i++) {
            waifuScores[files[i]] = 1;
        }
        backupScores();
    }
    else {
        var fileText = fs.readFileSync(scoreFile).toString();
        var lines = fileText.split("\n");
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].length == 0)
                break;
            var waifu = lines[i].slice(0, lines[i].lastIndexOf(" "));
            var score = lines[i].slice(lines[i].lastIndexOf(" ")+1, lines[i].length);
            waifuScores[waifu] = score;
        }
    }
    
    //Husbundo scores
    if(!fs.existsSync(husbundoScoreFile)) {
        var files = fs.readdirSync(husbundoDir);
        for(var i = 0; i < files.length; i++) {
            husbundoScores[files[i]] = 1;
        }
        backupScores();
    }
    else {
        var fileText = fs.readFileSync(husbundoScoreFile).toString();
        var lines = fileText.split("\n");
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].length == 0)
                break;
            var husbundo = lines[i].slice(0, lines[i].lastIndexOf(" "));
            var score = lines[i].slice(lines[i].lastIndexOf(" ")+1, lines[i].length);
            husbundoScores[husbundo] = score;
        }
    }
    
    //Waifu last votes
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
    //Husbundo last votes
    if(fs.existsSync(husbundoLastVoteFile)) {
        var fileText = fs.readFileSync(husbundoLastVoteFile).toString();
        var lines = fileText.split("\n");
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].length == 0)
                break;
            var splitLine = lines[i].split(" ");
            var userId = splitLine[0];
            var voteDay = splitLine[1];
            var numVotes = splitLine[2];
            husbundoLastVote[userId] = voteDay;
            husbundoVotes[userId] = numVotes;
        }
    }
}

function backupScores() {
    //Waifus
    var fileText = "";
    for(waifu in waifuScores) {
        fileText += waifu + " " + waifuScores[waifu] + "\n";
    }
    fs.writeFileSync(scoreFile, fileText);
    
    fileText = "";
    for(vote in lastVote) {
        if(!votes[vote])
            votes[vote] = 0;
        fileText += vote + " " + lastVote[vote] + " " + votes[vote] + "\n";
    }
    fs.writeFileSync(lastVoteFile, fileText);
    
    //Husbundo
    fileText = "";
    for(husbundo in husbundoScores) {
        fileText += husbundo + " " + husbundoScores[husbundo] + "\n";
    }
    fs.writeFileSync(husbundoScoreFile, fileText);
    
    fileText = "";
    for(vote in husbundoLastVote) {
        if(!husbundoVotes[vote])
            husbundoVotes[vote] = 0;
        fileText += vote + " " + husbundoLastVote[vote] + " " + husbundoVotes[vote] + "\n";
    }
    fs.writeFileSync(husbundoLastVoteFile, fileText);
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
    else if(message.startsWith("!husbundo")) {
        noHusbundoNoLaifundo(msg);
    }
    else if(message.startsWith("!listhusbundos")) {
        listHusbundos(msg);
    }
    else if(message.startsWith("!listwaifus")) {
        listWaifus(msg);
    }
    else if(message.startsWith("!incoming ")) {
        changeIncomingMode(msg);
    }
    else if(message.startsWith("!incominghusbundo ")) {
        changeIncomingHusbundoMode(msg);
    }
    else if(message.startsWith("!currenthusbundo")) {
        var husbundoDisplay = getCapitalizedName(currentHusbundo);
        msg.reply("I'm currently waiting for pictures of " + husbundoDisplay);
    }
    else if(message.startsWith("!current")) {
        var waifuDisplay = getCapitalizedName(currentWaifu);
        msg.reply("I'm currently waiting for pictures of " + waifuDisplay);
    }
    else if(message.startsWith("!bestgirl ")) {
        voteForBestGirl(msg);
    }
    else if(message.startsWith("!bestboy ")) {
        voteForBestBoy(msg);
    }
    else if(message.startsWith("!whoisbestgirl")) {
        whoIsBestGirl(msg);
    }
    else if(message.startsWith("!whoisbestboy")) {
        whoIsBestBoy(msg);
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
        + "*!husbundo*: I'll show you a husbundo picture\n"
        + "*!husbundo (name of husbundo)*: I'll show you a picture of the husbundo you specified\n"
        + "*!listwaifus*: I'll tell you all of the waifus I currently have pictures of\n"
        + "*!listhusbundos*: I'll tell you all of the husbundo I currently have pictures of\n"
        + "*!incoming (name of waifu)*: I prepare to receive a picture of the waifu with that name. If I receive any pictures, I will save it under the folder for that waifu\n"
        + "*!incominghusbundo (name of husbundo)*: I prepare to receive a picture of the husbundo with that name. If I receive any pictures, I will save it under the folder for that husbundo\n"
        + "*!current*: I'll tell you the name of the waifu I'm currently waiting for\n"
        + "*!currenthusbundo*: I'll tell you the name of the husbundo I'm currently waiting for\n"
        + "*!bestgirl (name of waifu)*: This will cast a vote for the specified girl as Best Girl\n"
        + "*!bestboy (name of husbundo)*: This will cast a vote for the specified boy as Best Boy\n"
        + "*!whoisbestgirl*: I'll give you the current ranking of the waifus based on your votes\n"
        + "*!whoisbestboy*: I'll give you the current ranking of the husbundos based on your votes");
}

function noWaifuNoLaifu(msg) {
    var chosenWaifu = getStringAfterSpace(msg.content.toLowerCase());
    if(chosenWaifu) {
        if(!fs.existsSync(waifuDir + "/" + chosenWaifu)) {
            var waifuDisplay = getCapitalizedName(chosenWaifu);
            msg.reply("I have no pictures of " + waifuDisplay + " D:\n"
                    + "I am now awaiting pictures of that waifu, so feel free to send me some now!");
            currentWaifu = chosenWaifu;
            setMiscTimer();
            return;
        }
    }
    else {
        chosenWaifu = getRandomVotedWaifu();
    }
    var waifuDisplay = getCapitalizedName(chosenWaifu);
    sendWaifuPicWithMessage(msg, waifuDisplay, chosenWaifu);
}

function sendWaifuPicWithMessage(msg, message, waifu) {
    var waifuPic = getRandomFileFromFolder(waifuDir+"/"+waifu);
    msg.channel.send(message, new Discord.Attachment(waifuDir+"/"+waifu+"/"+waifuPic));
}

function noHusbundoNoLaifundo(msg) {
    var chosenHusbundo = getStringAfterSpace(msg.content.toLowerCase());
    if(chosenHusbundo) {
        if(!fs.existsSync(husbundoDir + "/" + chosenHusbundo)) {
            var husbundoDisplay = getCapitalizedName(chosenHusbundo);
            msg.reply("I have no pictures of " + husbundoDisplay + " D:\n"
                    + "I am now awaiting pictures of that husbundo, so feel free to send me some now!");
            currentHusbundo = chosenHusbundo;
            setMiscTimer();
            return;
        }
    }
    else {
        chosenHusbundo = getRandomVotedHusbundo();
    }
    var husbundoDisplay = getCapitalizedName(chosenHusbundo);
    sendHusbundoPicWithMessage(msg, husbundoDisplay, chosenHusbundo);
}

function sendHusbundoPicWithMessage(msg, message, husbundo) {
    var husbundoPic = getRandomFileFromFolder(husbundoDir+"/"+husbundo);
    msg.channel.send(message, new Discord.Attachment(husbundoDir+"/"+husbundo+"/"+husbundoPic));
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

function getRandomVotedWaifu()
{
    var totalVotes = getTotalVotes();
    var index = getRandomInt(1, totalVotes);
    var chosenWaifu = getWaifuFromScoreIndex(index);
    return chosenWaifu;
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

function getRandomVotedHusbundo()
{
    var totalVotes = getTotalHusbundoVotes();
    var index = getRandomInt(1, totalVotes);
    var chosenHusbundo = getHusbundoFromScoreIndex(index);
    return chosenHusbundo;
}

function getTotalHusbundoVotes() {
    var votes = 0;
    for(var husbundo in husbundoScores) {
        votes += parseInt(husbundoScores[husbundo]);
    }
    return votes;
}

function getHusbundoFromScoreIndex(index) {
    var bestBoys = getRankedBoyList();
    for(var i=0; i < bestBoys.length; i++) {
        index -= bestBoys[i][1];
        if(index <= 0)
            return bestBoys[i][0];
    }
    return bestBoys[bestBoys.length-1][0];
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

function listHusbundos(msg) {
    var files = fs.readdirSync(husbundoDir);
    var husbundoList = "Here are all of the husbundos I currently have pictures of:\n";
    for(var i = 0; i < files.length; i++) {
        var husbundoDisplay = getCapitalizedName(files[i]);
        husbundoList += (i+1) + ". " + husbundoDisplay + "\n"
    }
    msg.channel.send(husbundoList);
}

function changeIncomingMode(msg) {
    var message = msg.content.toLowerCase();
    requestedWaifu = getStringAfterSpace(message);
    
    if(requestedWaifu.indexOf('.') > -1 || requestedWaifu.indexOf('\\') > -1 || requestedWaifu.indexOf('/') > -1 || requestedWaifu.indexOf(':') > -1 || requestedWaifu.indexOf('*') > -1 || requestedWaifu.indexOf('?') > -1 || requestedWaifu.indexOf('\"') > -1 || requestedWaifu.indexOf('<') > -1 || requestedWaifu.indexOf('>') > -1 || requestedWaifu.indexOf('|') > -1) {
        msg.reply("I see what you're doing there. Nice try. You can't have a ., /, \\, :, ?, \", <, >, or | in your waifu name.");
        return;
    }
    
    waifuMode = true;
    currentWaifu = requestedWaifu;
    var waifuDisplay = getCapitalizedName(currentWaifu);
    msg.channel.send("Ready to receive pictures of " + waifuDisplay);
    setMiscTimer();
}

function changeIncomingHusbundoMode(msg) {
    var message = msg.content.toLowerCase();
    requestedHusbundo = getStringAfterSpace(message);
    
    if(requestedHusbundo.indexOf('.') > -1 || requestedHusbundo.indexOf('\\') > -1 || requestedHusbundo.indexOf('/') > -1 || requestedHusbundo.indexOf(':') > -1 || requestedHusbundo.indexOf('*') > -1 || requestedHusbundo.indexOf('?') > -1 || requestedHusbundo.indexOf('\"') > -1 || requestedHusbundo.indexOf('<') > -1 || requestedHusbundo.indexOf('>') > -1 || requestedHusbundo.indexOf('|') > -1) {
        msg.reply("I see what you're doing there. Nice try. You can't have a ., /, \\, :, ?, \", <, >, or | in your husbundo name.");
        return;
    }
    
    waifuMode = false;
    currentHusbundo = requestedHusbundo;
    var husbundoDisplay = getCapitalizedName(currentHusbundo);
    msg.channel.send("Ready to receive pictures of " + husbundoDisplay);
    setMiscTimer();
}

//After 5 minutes of inactivity, sets the waifu back to misc
function setMiscTimer() {
    if(miscTimer)
    {
        clearTimeout(miscTimer);
    }
    miscTimer = setTimeout(function(){
        currentWaifu = "misc";
        currentHusbundo = "misc";
        waifuMode = true;
    }, 1000*60*5);
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
        if(waifuMode) {
            if(!fs.existsSync(waifuDir+"/" + currentWaifu)) {
                fs.mkdirSync(waifuDir+"/" + currentWaifu);
                waifuScores[currentWaifu] = 1;
                backupScores();
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
        else {
            if(!fs.existsSync(husbundoDir+"/" + currentHusbundo)) {
                fs.mkdirSync(husbundoDir+"/" + currentHusbundo);
                husbundoScores[currentHusbundo] = 1;
                backupScores();
            }
            while(fs.existsSync(husbundoDir+"/" + currentHusbundo + "/" + filename)) {
                filename_count++;
                filename = filename_count + "." + filetype;
            }
            console.log("Downloading it as " + husbundoDir + "/" + currentHusbundo + "/" + filename);
            download(attachments[i].url, husbundoDir+"/"+currentHusbundo+"/"+filename, function() {
                console.log("Done");
            });
        }
    }
    setMiscTimer();
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
        setMiscTimer();
        return;
    }
    
    waifuScores[bestGirl]++;
    votes[userId]++;
    lastVote[userId] = date.getDate();
    backupScores();
    var bestGirlDisplay = getCapitalizedName(bestGirl);
    msg.reply("Vote cast for " + bestGirlDisplay + ". They are now at " + waifuScores[bestGirl] + " points!");
    if(waifuScores[bestGirl] == 69) {
        msg.reply("Nice");
    }
}

function voteForBestBoy(msg) {
    var userId = msg.author.id;
    var date = new Date();
    if(!husbundoVotes[userId] || (husbundoLastVote[userId] && date.getDate() != husbundoLastVote[userId]))
        husbundoVotes[userId] = 0;
    if(husbundoVotes[userId] >= 5) {
        msg.reply("You've already used up all your daily votes! You only get 5 votes per day. Come back tomorrow to votes again.");
        return;
    }
    
    var message = msg.content.toLowerCase();
    var bestBoy = getStringAfterSpace(message);
    
    if(!fs.existsSync(husbundoDir + "/" + bestBoy)) {
        var bestBoyDisplay = getCapitalizedName(bestBoy);
        msg.reply("I have no pictures of " + bestBoyDisplay + " D:\n"
                + "I am now awaiting pictures of that husbundo, so feel free to send me some now!");
        currentHusbundo = bestBoy;
        setMiscTimer();
        return;
    }
    
    husbundoScores[bestBoy]++;
    husbundoVotes[userId]++;
    husbundoLastVote[userId] = date.getDate();
    backupScores();
    var bestBoyDisplay = getCapitalizedName(bestBoy);
    msg.reply("Vote cast for " + bestBoyDisplay + ". They are now at " + husbundoScores[bestBoy] + " points!");
    if(husbundoScores[bestBoy] == 69) {
        msg.reply("Nice");
    }
}

function whoIsBestGirl(msg) {
    var bestGirls = getRankedGirlList();
    
    var girlRankings = "Best girls are:\n";
    for(var i = 0; i < bestGirls.length; i++) {
        var girlName = getCapitalizedName(bestGirls[i][0]);
        girlRankings += (i+1) + ". " + girlName + ": " + bestGirls[i][1] + "\n";
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

function whoIsBestBoy(msg) {
    var bestBoys = getRankedBoyList();
    
    var boyRankings = "Best boys are:\n";
    for(var i = 0; i < bestBoys.length; i++) {
        var boyName = getCapitalizedName(bestBoys[i][0]);
        boyRankings += (i+1) + ". " + boyName + ": " + bestBoys[i][1] + "\n";
    }
    sendHusbundoPicWithMessage(msg, boyRankings, bestBoys[0][0]);
}

function getRankedBoyList() {
    var bestBoys = Object.keys(husbundoScores).map(function(key) {
        return [key, husbundoScores[key]];
    });

    // Sort the array based on the second element
    bestBoys.sort(function(first, second) {
        return second[1] - first[1];
    });
    return bestBoys;
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