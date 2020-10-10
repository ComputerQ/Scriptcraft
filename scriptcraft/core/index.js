const config = require("../config.json");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const util = require("util");
const ncp = require('ncp').ncp;
ncp.limit = 16;

const stat = util.promisify(fs.stat);

const prefix = config.prefix;

let processes = {};

echo("@a", "Reloaded ScriptCraft!", "gold");

process.on("message", async function(message) {
    message = message.replace(/\n/g, "").replace(/\r/g, "");

    if (message.match(/\[.+?\] \[.+?\]: Done \(.+?\)/)) {
        console.log("Server online!");
        const len = config.startCommands.length;
        for (let i = 0; i < len; i++) {
            const command = config.startCommands[i];
            process.send(command);
        };
    };

    message = message.replace(/\[.+?\] \[.+?\]: /, "");

    try {
        const user = message.split("<")[1].split(">")[0];
        const command = message.split(prefix)[1].split(" --")[0];
        const commandName = command.split("(")[0];
        const param = getExecutionParam(message.replace(command, ""));
        const args = getCommandArgs(command.replace(commandName, ""));

        const folderName = param.in ? param.in : user;

        if (!command) {
            return;
        };

        switch (commandName) {
            case "kill":
                const msg = killUserProcess(user) ? "Killed process." : "You have no running process.";
                echo(user, msg, "yellow");
                return;
            case "create":
                const who = param.for ? param.for : user;
                const version = param.v ? param.v : "1.16.3";
                const name = param.n;
                if (!name) {
                    return;
                };
                const completePath = path.join(__dirname, "../", "user", who, name)
                try {
                    await stat(completePath);
                    echo(user, `"${name}" already exists in folder "${who}".`, "red");
                } catch (err) {
                    ncp(path.join(__dirname, "../", "template", version), completePath, function(err) {
                        if (err) {
                            return console.error(err);
                        }
                        echo(user, `Created new script folder "./${who}/${name}/"`, "green");
                    });
                };
                return;
        };

        if (await spawnUserProcess(user, path.join(__dirname, `../user/${folderName}/${commandName}/index.js`), {
                user: user,
                command: command,
                args: args
            })) {
            echo(user, `Executing ${command} in ${folderName}`, "yellow");
            return;
        };

        if (await spawnUserProcess(user, path.join(__dirname, `../global/${commandName}/index.js`), {
                user: user,
                command: command,
                args: args
            })) {
            echo(user, `Executing ${command}`, "yellow");
            return;
        };

        try {
            let data = eval(command).toString().replace(/\r/g, "").replace(/\\/g, "\\\\").split("\n");

            const len = data.length;
            for (let i = 0; i < len; i++) {
                echo(user, data[i], yellow);
            };
            return;
        } catch (err) {};

        echo(user, "Nothing happend!", "yellow");
    } catch (err) {};
});

function echo(user, text, color) {
    text = text.replace(/"/g, "\\\"");
    process.send(`tellraw ${user} {"text":"${text}","color":"${color}"}`);
}

function getCommandArgs(command) {
    const arr = eval(command.replace("(", "[").replace(")", "]"));
    return arr ? arr : [];
};

function getExecutionParam(command) {
    let param = command.split(" --");
    let ret = {};
    for (let i = 0; i < param.length; i++) {
        let a = param[i].split(" ");
        try {
            ret[a[0]] = a[1];
        } catch (err) {};
    };
    return ret;
};

async function spawnUserProcess(user, path, args) {
    try {
        await stat(path);
    } catch (err) {
        return false;
    };

    if (processes[user]) {
        processes[user].kill("SIGINT");
    };

    processes[user] = cp.fork(path, [args.user, args.command, ...args.args], { silent: true });
    processes[user].on("message", function(message) {
        process.send(message);
    });

    processes[user].stderr.on("data", function(data) {
        data = data.toString().replace(/\r/g, "").replace(/\\/g, "\\\\").split("\n");

        const len = data.length;
        for (let i = 0; i < len; i++) {
            echo(user, data[i], "red");
        };
    });

    processes[user].stdout.on("data", function(data) {
        data = data.toString().replace(/\r/g, "").replace(/\\/g, "\\\\").split("\n");

        const len = data.length;
        for (let i = 0; i < len; i++) {
            echo(user, data[i], "blue");
        };
    });

    echo(user, `Executing ${command} in ${folderName}`, "yellow");
    return true;
};

function killUserProcess(user) {
    if (processes[user]) {
        processes[user].kill("SIGINT");
        return true;
    } else {
        return false;
    };
};

process.on("uncaughtException", async function(err) {
    console.error(err);
});