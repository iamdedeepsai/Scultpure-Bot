const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const talkedRecently = new Set();
const config = JSON.parse(fs.readFileSync('config.json').toString());
client.login(config.token);
const types = {
    Basic: 10,
    Intermediate: 20,
    Advanced: 40,
    Expert: 80,
    Master: 150,
    LeChosenOne: 200
}

const prices = {
    Intermediate: 10000,
    Advanced: 50000,
    Expert: 200000,
    Master: 500000,
    LeChosenOne: 1000000
}

const levels = ["Basic", "Intermediate", "Advanced", "Expert", "Master", "LeChosenOne"];

const colours = ["red", "blue", "black", "cyan", "green", "lime", "yellow"];

client.once('ready', () => {
    console.log('Ready!');
});

client.on("guildCreate", guild => {
    var found = false;
    guild.channels.forEach(function (channel, id) {
        // If a channel is already found, nothing more needs to be done
        if (found == true || channel.type != "text") {
            return;
        }
        // If the channel isn't found and the bot has permission to 
        // send and read messages in the channel, send a welcome message there
        if (guild.me.permissionsIn(channel).has("SEND_MESSAGES") && guild.me.permissionsIn(channel).has("VIEW_CHANNEL")) {
            found = true;
            return channel.send("Thanks for adding me, I am Scultpure a bot! Type //help to learn the commands!")
        }
    })
});

client.on('message', function(msg){
    help(msg);
    say(msg);
    work(msg);
    generate(msg);
    profile(msg);
    upgrade(msg);
    give(msg);
    createGame(msg);
    join(msg);
    startGame(msg);
    vote(msg);
});

function say(msg) {
    str = msg.content.split(" ");
    message = "";
    if (str[0].toLowerCase() === "//say" && msg.author.id != "776293568763002891") {
        for (let i = 1; i < str.length; i++) {
            if (str[i] == "stupid") {
                message = "Yeah we know that.";
            } else {
                message += str[i] + " ";
            }
        }
        msg.channel.send(message);
    }
}

function help(msg) {
    if (msg.content == "//help" && msg.author.id != "776293568763002891"){
        msg.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL()
                },
                title: "Scultpure Help: ",
                fields: [{
                    name: "Commands for Scultpure",
                    value: `\`//help: A command that you just used
//work: Wow! Who knew looking at scultpures gives you a random amount of coins with a range from 50 - 1000 (cooldown: 30 seconds)
//start: Your scultpure starts to generate coins every second. The number of coins generated depends on your type of scultpure. 
//upgrade: Upgrade your scultpure to the next level to generate more coins. 
//give @(user) <no. of coins> : Gives the mentioned amount of coins to the mentioned. 
//prof: See your profile. 
//createGame: Creates a game of deception. 
//join: joins the created game.

UPCOMING:
//createGame(UNO): Creates a game of UNO.
//join(UNO): Join the created game of UNO.\``
                },
                {
                    name: "Coin generation rates: ",
                    value: `\`Basic : 10
Intermediate: 20
Advanced: 40
Expert: 80
Master: 150
LeChosenOne: 200 \``
                },
                {
                    name: "Price of upgrades: ",
                    value: `\`Basic: Free
Intermediate: 10000
Advanced: 50000
Expert: 200000
Master: 500000
LeChosenOne: 1000000\``
                }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL(),
                    text: "Scultpure"
                }
            }
        });
    }
}

function work(msg) {
    if (config.coins[msg.author.id] == null) {
        config.coins[msg.author.id] = 0;
    }
    if (msg.content === "//work" && msg.author.id != "776293568763002891") {
        let cooldown = 30 * 1000;
        if (talkedRecently.has(msg.author.id)) {
            let now = (new Date()).getTime();
            let expirationTime = config.times[msg.author.id] + cooldown;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                msg.reply(`Please wait ${timeLeft.toFixed(1)} seconds before using //work again.`);
            }
        } else {
            var c = Math.floor(Math.random() * (1000 - 50) + 50);
            config.coins[msg.author.id] += c;
            msg.reply(`Nice, you got ${c} coins! You now have a total of ${config.coins[msg.author.id]} coins!`);
            talkedRecently.add(msg.author.id);
            config.times[msg.author.id] = (new Date()).getTime();
            setTimeout(() => {
                talkedRecently.delete(msg.author.id);
            }, cooldown);
        }
    }
}

function generate(msg) {
    if (config.types[msg.author.id] == null) {
        config.types[msg.author.id] = "Basic";
    }
    if (config.coins[msg.author.id] == null) {
        config.coins[msg.author.id] = 0;
    }
    if (msg.content === "//start" && config.started[msg.author.id] != true && msg.author.id != "776293568763002891") {
        clearInterval(gen);
        var gen = setInterval(function () { config.coins[msg.author.id] += types[config.types[msg.author.id]] }, 1000);
        msg.reply(`You have started your profile!`)
        config.started = true;
    } else if (msg.content === "//start" && config.started[msg.author.id]) {
        msg.reply("you have already started your profile.")
    }
}

function profile(msg) {
    var m = msg.author.id;
    if (msg.content === "//prof" && msg.author.id != "776293568763002891") {
        message = `
\`Your Profile:
Coins: ${config.coins[m]}
Type: ${config.types[m]}\``
        msg.reply(message);
    }
}

function upgrade(msg) {
    var m = msg.author.id;
    if (msg.content == "//upgrade" && msg.author.id != "776293568763002891") {
        if (config.types[m] != levels[levels.length - 1]) {
            if (config.coins[m] >= prices[levels[levels.indexOf(config.types[m]) + 1]]) {
                config.coins[m] -= prices[levels[levels.indexOf(config.types[m]) + 1]];
                msg.reply(`You have upgraded from ${config.types[m]} to ${levels[levels.indexOf(config.types[m]) + 1]}`)
                config.types[m] = levels[levels.indexOf(config.types[m]) + 1];
            } else {
                msg.reply("You do not have enough coins to go to the next level")
            }
        } else {
            msg.reply("You are Le Chosen One! You cannot upgrade anymore.");
        }
    }
}

function give(msg) {
    var regExp = /[a-zA-Z]/g;
    var m = msg.author.id;
    var t;
    var str = msg.content.split(" ");
    if (str[0] == "//give") {
        if (msg.mentions.members.first()) {
            t = msg.mentions.users.first().id;
        }
    }
    var c;
    if (str.length == 3 && !regExp.test(str[str.length - 1])) {
        c = parseInt(str[2]);
    }
    if (str[0] == "//give" && msg.author.id != "776293568763002891") {
        if (config.coins[t] == null) {
            config.coins[t] = 0;
            config.types[t] = "Basic";
        }
        if (str.length != 3) {
            msg.reply("invalid parameters!");
        } else if (regExp.test(str[2])){
            msg.reply("invalid parameters!");
        } else if (config.coins[m] < c) {
            msg.reply("You do not have enough coins to give");
        } else {
            config.coins[m] -= c;
            config.coins[t] += c;
            msg.reply(`you have succesfully given ${c} coins to <@${t}>. They now have ${config.coins[t]} coins and you have ${config.coins[m]} coins. `)
        }
    }
}

function shop(msg) {
    if (msg.content == "//shop") {
        
    }
}

function createGame(msg) {
    var regExp = /[a-zA-Z]/g;
    if (msg.content.startsWith("//createGame") && config.lobbies[msg.channel.id] == null && msg.author.id != "776293568763002891") {
        var str = msg.content.split(" ");
        if (regExp.test(str[1]) == false && str.length == 2 && parseInt(str[1]) >= 1) {
            msg.channel.send(`<@${msg.author.id}> has started a game of deception with ${str[1]} players! Use //join to join the game!`);
            config.lobbies[msg.channel.id] = {};
            config.lobbies[msg.channel.id].players = [];
            config.lobbies[msg.channel.id].players.push(msg.author.id);
            config.lobbies[msg.channel.id].playerLimit = parseInt(str[1]);
            config.lobbies[msg.channel.id].votes = {};
            config.lobbies[msg.channel.id].voted = [];
            config.lobbies[msg.channel.id].started = false;
        } else {
            msg.reply("Invalid parameters or number of players is set below 3.");
        }
    } else if(msg.content.startsWith("//createGame") && config.lobbies[msg.channel.id] != null){
        msg.reply("sorry, a game of has already been started and has not ended yet.");
    }
}

function join(msg) {
    if(config.lobbies[msg.channel.id] != null){
        if(config.lobbies[msg.channel.id].started != null){
            if(config.lobbies[msg.channel.id].started = false){
                setTimeout(function(){
                    msg.channel.send("Game has been cancelled because not enough people have joined after 5 minutes");
                    delete config.lobbies[msg.channel.id];
                }, 5 * 60 * 1000);
            }
        }
    }
    if (config.lobbies[msg.channel.id] != null && !config.lobbies[msg.channel.id].players.includes(msg.author.id) && (config.lobbies[msg.channel.id].playerLimit - config.lobbies[msg.channel.id].players.length) > 0 && msg.content == "//join" && msg.author.id != "776293568763002891") {
        msg.channel.send(`<@${msg.author.id}> has joined the game! ${(config.lobbies[msg.channel.id].playerLimit - config.lobbies[msg.channel.id].players.length - 1 != 1) ? (config.lobbies[msg.channel.id].playerLimit - config.lobbies[msg.channel.id].players.length - 1) + " slots": "1 slot"} left! Use //join to join the game!`);
        config.lobbies[msg.channel.id].players.push(msg.author.id);
    } else if (msg.content == "//join"){
        msg.reply("you have already joined or a game has not been started or all slots have been taken.")
    }
}

function startGame(msg) {
    if (msg.content == "//startGame" && config.lobbies[msg.channel.id] != null && !config.lobbies[msg.channel.id].started && msg.author.id != "776293568763002891"  && config.lobbies[msg.channel.id].players.length == config.lobbies[msg.channel.id].playerLimit) {
        var message = "";
        config.lobbies[msg.channel.id].startTime = 5 * 60 * 1000;
        var colors = colours;
        var imp = colours[Math.floor(Math.random() * colours.length)];
        var impIndex = Math.floor(Math.random() * config.lobbies[msg.channel.id].players.length);
        var x = colors.indexOf(imp);
        colors.splice(x, 1);
        config.lobbies[msg.channel.id].started = true;
        var crew = colours[Math.floor(Math.random() * colours.length)];
        for (var i = 0; i < config.lobbies[msg.channel.id].players.length; i++) {
            var user = client.users.cache.get(config.lobbies[msg.channel.id].players[i]);
            message += "<@" + config.lobbies[msg.channel.id].players[i] + ">, ";
            config.lobbies[msg.channel.id].votes[config.lobbies[msg.channel.id].players[i]] = 0;
            if (i == impIndex) {
                user.send(imp);
                config.lobbies[msg.channel.id].imp = config.lobbies[msg.channel.id].players[i]; 
            } else {
                user.send(crew);
            }
        }
        msg.channel.send(`The game has started, the players are ${message} have fun!`)
    } else if(msg.content == "//startGame"){
        msg.reply("you have not created a game yet or the game has already started.")
    }
}

function vote(msg) {
    if(config.lobbies[msg.channel.id] != null){
        if(config.lobbies[msg.channel.id].started){
            timer = setInterval(config.lobbies[msg.channel.id].startTime -= 1, 1);
            setTimeout(msg.channel.send("You have 1 minute left to vote."), 4 * 60 * 1000);
            if(config.lobbies[msg.channel.id].startTime == 0){
                clearInterval(timer);
                delete config.lobbies[msg.channel.id];
                msg,channel.send("You have taken too long to vote. Hence the game has ended.");
            }
        }
    }
    if (msg.content.startsWith("//vote") && config.lobbies[msg.channel.id] != null) {
        if (config.lobbies[msg.channel.id].imp != null) {
            var str = msg.content.split(" ");
            if (str.length == 2 && str[1].startsWith("<@") && str[1].endsWith(">") && config.lobbies[msg.channel.id].players.includes(msg.author.id) && !(config.lobbies[msg.channel.id].voted.includes(msg.author.id))) {
                t = msg.mentions.members.first().id;
                if (config.lobbies[msg.channel.id].players.includes(msg.author.id)) {
                    config.lobbies[msg.channel.id].votes[t] += 1;
                    config.lobbies[msg.channel.id].voted.push(msg.author.id);
                    msg.channel.send(`<@${msg.author.id}> has voted, ${(config.lobbies[msg.channel.id].players.length - config.lobbies[msg.channel.id].voted.length )} more players need to vote.`);
                } else {
                    msg.reply("voted player is not in the game");
                    return;
                }
                if ((config.lobbies[msg.channel.id].voted.length - config.lobbies[msg.channel.id].players.length) == 0) {
                    var arr = [];
                    var arr1 = [];
                    config.lobbies[msg.channel.id].highest = 0;
                    for (var i = 0; i < config.lobbies[msg.channel.id].players.length; i++) {
                        if (config.lobbies[msg.channel.id].votes[config.lobbies[msg.channel.id].players[i]] > config.lobbies[msg.channel.id].highest) {
                            config.lobbies[msg.channel.id].highest = config.lobbies[msg.channel.id].votes[config.lobbies[msg.channel.id].players[i]];
                        }
                        arr.push(config.lobbies[msg.channel.id].votes[config.lobbies[msg.channel.id].players[i]]);
                        arr1.push(config.lobbies[msg.channel.id].players[i]);
                    }
                    for (var i = 0; i < config.lobbies[msg.channel.id].players.length; i++) {
                        if (arr[i] == config.lobbies[msg.channel.id].highest) {
                            msg.channel.send(`<@${arr1[i]}> was ejected.`);
                            if (arr1[i] == config.lobbies[msg.channel.id].imp) {
                                msg.channel.send(`Crewmates win, <@${arr1[i]}> was the imposter, each crewmate has won 500 coins!`);
                                for (var i = 0; i < arr1.length; i++) {
                                    if (arr1[i] != config.lobbies[msg.channel.id].imp) config.coins[arr1[i]] += 500;
                                }
                                delete config.lobbies[msg.channel.id];
                                return;
                            } else {
                                msg.channel.send(`Imposter wins, <@${config.lobbies[msg.channel.id].imp}> was the imposter. <@${config.lobbies[msg.channel.id].imp}> wins 1000 coins!`);
                                delete config.lobbies[msg.channel.id];
                                config.coins[config.lobbies[msg.channel.id].imp] += 1000;
                                return;
                            }
                        }
                    }

                }

            } else {
                msg.reply("invalid parameters or you are not in the game or you have already voted.");
            }
        }
    }
}









