let s = function(data) { process.send(data); };

let dronename;
module.exports = {
    Drone: {
        owner: "Quinten_Muyllaert",
        name: "MissingNo.",
        initLocation: [0, 0, 0],
        location: [0, 0, 0],
        rotation: 0,
    },
    init: function() {
        this.Drone.owner = process.argv[2];
        this.Drone.name = Math.random();
        dronename = this.Drone.name;

        s(`execute at ${this.Drone.owner} run summon item_frame ~ ~ ~ {Facing:0b,Invulnerable:1b,Invisible:1b,CustomName:'{"text":"frame_${this.Drone.name}"}',Item:{}}`);
        s(`execute at @e[type=item_frame,name="frame_${this.Drone.name}"] run summon armor_stand ~ ~ ~ {NoGravity:1b,Invulnerable:1b,Small:0b,Invisible:1b,NoBasePlate:1b,Rotation:[0F,0F],ArmorItems:[{},{},{},{id:"minecraft:gold_block",Count:1b}],CustomName:"{\\"text\\":\\"drone_${this.Drone.name}\\"}"}`)
        s(`kill @e[type=item_frame,name="frame_${this.Drone.name}"]`);

        this.arg = process.argv;
        this.arg.shift();
        this.arg.shift();
        this.arg.shift();
        this.arg.shift();
    },
    echo: function(txt, color) {
        txt = txt.replace(/"/g, "\\\"").replace(/\\/g, "\\\\");
        if (color) {
            s(`tellraw ${this.Drone.owner} {"text":"${txt}","color":"${color}"}`);
        } else {
            s(`tellraw ${this.Drone.owner} "${txt}"`);
        };
        return this;
    },
    points: {},
    chkpt: function(name) {
        this.points[name] = JSON.parse(JSON.stringify(this.Drone));
        return this;
    },
    move: function(name) {
        if (this.points[name] != null) {
            this.Drone = JSON.parse(JSON.stringify(this.points[name]));
            s(`execute at @e[type=armor_stand,name="drone_${this.Drone.name}"] run tp @e[type=armor_stand,name=${this.Drone.name}] ~${this.Drone.location[0]} ~${this.Drone.location[1]} ~${this.Drone.location[2]}`);
            s(`execute at @e[type=armor_stand,name=${this.Drone.name}] run data merge entity @e[type=armor_stand,name=${this.Drone.name},sort=nearest,limit=1] {Rotation:[${((this.Drone.rotation + 2) % 4) * 90}F,0F]}`);
        }
        return this;
    },
    box: function(block, rechts, boven, diepte) {
        if (!(rechts == 0 || boven == 0 || diepte == 0)) {
            rechts--;
            boven--;
            diepte--;

            var x = parseFloat(this.Drone.initLocation[0]) + parseFloat(this.Drone.location[0]);
            var y = parseFloat(this.Drone.initLocation[1]) + parseFloat(this.Drone.location[1]);
            var z = parseFloat(this.Drone.initLocation[2]) + parseFloat(this.Drone.location[2]);

            var xs, zs;
            switch (this.Drone.rotation) {
                case 0:
                    xs = rechts;
                    zs = -diepte;
                    break;
                case 1:
                    xs = diepte;
                    zs = rechts;
                    break;
                case 2:
                    xs = -rechts;
                    zs = diepte;
                    break;
                case 3:
                    xs = -diepte;
                    zs = -rechts;
                    break;
            }
            s(`execute at @e[type=armor_stand,name="drone_${this.Drone.name}"] run fill ~${Math.trunc(x)} ~${Math.trunc(y)} ~${Math.trunc(z)} ~${Math.trunc(x + xs)} ~${Math.trunc(y + boven)} ~${Math.trunc(z + zs)} ${block}`);
        }
        return this;
    },
    turn: function(amt) {
        if (amt == null) {
            this.Drone.rotation = this.Drone.rotation + 1;
        } else {
            this.Drone.rotation = this.Drone.rotation + amt;
        }
        this.Drone.rotation = this.Drone.rotation % 4;
        return this;
    },
    fwd: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        switch (this.Drone.rotation) {
            case 0:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) - amt;
                break;
            case 1:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) + amt;
                break;
            case 2:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) + amt;
                break;
            case 3:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) - amt;
                break;
        }
        return this;
    },
    back: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        switch (this.Drone.rotation) {
            case 0:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) + amt;
                break;
            case 1:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) - amt;
                break;
            case 2:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) - amt;
                break;
            case 3:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) + amt;
                break;
        }
        return this;
    },
    left: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        switch (this.Drone.rotation) {
            case 0:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) - amt;
                break;
            case 1:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) - amt;
                break;
            case 2:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) + amt;
                break;
            case 3:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) + amt;
                break;
        }
        return this;
    },
    right: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        switch (this.Drone.rotation) {
            case 0:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) + amt;
                break;
            case 1:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) + amt;
                break;
            case 2:
                this.Drone.location[0] = parseFloat(this.Drone.location[0]) - amt;
                break;
            case 3:
                this.Drone.location[2] = parseFloat(this.Drone.location[2]) - amt;
                break;
        }
        return this;
    },
    up: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        this.Drone.location[1] = parseFloat(this.Drone.location[1]) + amt;
        return this;
    },
    down: function(amt) {
        if (amt == null) {
            amt = 1;
        }
        this.Drone.location[1] = parseFloat(this.Drone.location[1]) - amt;
        return this;
    },
    command: function(txt) {
        s(`execute at @e[type=armor_stand,name="drone_${this.Drone.name}"] run execute positioned ~${this.Drone.location[0]} ~${this.Drone.location[1]} ~${this.Drone.location[2]} run ${txt}`);
        return this;
    }
}

module.exports.init();
global.echo = module.exports.echo;

function exitHandler(options, exitCode) {
    s(`kill @e[type=armor_stand,name="drone_${dronename}"]`);
    if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));