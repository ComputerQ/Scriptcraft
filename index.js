const config = require("./scriptcraft/config.json");
const cp = require("child_process");
const chokidar = require("chokidar");

const minecraftServer = cp.spawn("java", config.serverArgs);

minecraftServer.stdout.on("data", function(data) {
    scriptcraft.send(data.toString());
});

let scriptcraft = spawnScriptCraft();

chokidar.watch("./scriptcraft/core").on("all", (event, path) => {
    try {
        if (event == "add") {
            return;
        };
        console.log("Changes to ScriptCraft code!");
        scriptcraft.kill("SIGINT");
        scriptcraft = spawnScriptCraft();
        console.log("Reloaded ScriptCraft!");
    } catch (err) {
        console.log("An error has occured while reloading ScriptCraft.");
        console.error(err);
    };
});

function spawnScriptCraft() {
    sc = cp.fork("./scriptcraft/core/index.js");
    sc.on("message", function(message) {
        minecraftServer.stdin.write(message + "\n");
    });
    return sc;
}

process.on("uncaughtException", async function(err) {
    console.error(err);
});