window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

// Utility Method for Random Color
function randomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

// Cache Libraries
function SoundLib()
{
    this.loadedSounds = 0;
    this.hasError = false;

    this.loadSound = function(soundPath)
    {
        var sound = new Audio();

        sound.addEventListener("canplaythrough", this.handleLoad, false);

        sound.src = soundPath;

        return sound;
    };

    this.handleLoad = function()
    {
        game.soundlib.loadedSounds++;
    };

    this.sounds =
    {
        "complexity": this.loadSound("sound/Complexity.wav"),
        "healthymind": this.loadSound("sound/Healthy Mind.wav"),
        "parallelreality": this.loadSound("sound/Parallel Reality.wav")
    };
}

function ImageLib()
{
    this.loadedPictures = 0;
    this.hasError = false;

    this.loadImage = function(imagePath)
    {
        var image = new Image();

        image.addEventListener("load", this.handleLoad, false);
        image.addEventListener("error", this.handleError, false);

        image.src = imagePath;

        return image;
    };

    this.handleLoad = function()
    {
        game.imglib.loadedPictures++;
    };

    this.handleError = function()
    {
        game.imglib.hasError = true;
    };

    this.backgrounds =
    {
        "menu": this.loadImage("images/menu_bg.png")
    };

    this.gui =
    {
        "logo": this.loadImage("images/logo.png"),
        "button": this.loadImage("images/button.png"),
        "window": this.loadImage("images/window.png"),
        "playerbar": this.loadImage("images/player_bar.png"),
        "settings": this.loadImage("images/settings_button.png")
    };

    this.sprites =
    {
        "bird": [this.loadImage("images/bird1.png"), this.loadImage("images/bird2.png")],
        "clouds":
            [
                this.loadImage("images/pillow.png"),
                this.loadImage("images/pillow2.png"),
                this.loadImage("images/eastereggpillow.png")
            ],
        "humans":
            [
                this.loadImage("images/human.png"),
                this.loadImage("images/human2.png"),
                this.loadImage("images/humanhitlft1.png"),
                this.loadImage("images/humanhitlft2.png"),
                this.loadImage("images/humanhitrig1.png"),
                this.loadImage("images/humanhitrig2.png")
            ],
        "blocks":
            [
                this.loadImage("images/dirt.png")
            ]
    }
}

// Entity Methods
function Particle(x, y, radius, vx, vy, color)
{
    this.x = x;
    this.y = y;

    this.radius = radius;

    this.vx = vx;
    this.vy = vy;

    this.color = color;

    this.onupdate = function() { };

    this.draw = function()
    {
        game.fillCircle(this.x, this.y, this.radius, this.color);
    };
};

function Block(blockId, x, y, blocking)
{
    this.blockId = blockId;

    this.image = null;

    this.x = x;
    this.y = y;

    this.blocking = blocking;

    this.draw = function()
    {
        if (this.image == null) this.image = game.imglib.sprites.blocks[this.blockId];
        game.drawImage(this.image, this.x, this.y);
    };

    this.collides = function(entity)
    {
        if (!blocking) return false;

        if (entity.x < this.x + 32 && entity.x + 64 > this.x)
        {
            if (entity.y < this.y + 32 && entity.y + 64 > this.y)
            {
                return true;
            }
        }

        return false;
    }
}

function Entity(name, x, y, vx, vy, images)
{
    this.name = name;
    this.x = x;
    this.y = y;

    this.vx = vx;
    this.vy = vy;

    this.speed = 1;
    this.friction = 0.80;

    this.images = images;

    this.currentImg = 0;

    this.composition = "source-over";
    this.counter = 0;

    this.onupdate = function() { };

    this.draw = function()
    {
        if (this.images[0] == null)
        {
            game.drawImage(this.images, this.x, this.y, this.composition);
        }
        else
        {
            game.drawImage(this.images[this.currentImg], this.x, this.y, this.composition);
        }
    };
}

function MouseEvent(parent, startX, startY, endX, endY, action)
{
    this.parent = parent;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.action = action;
}

function createWindow(title)
{
    var wndEntity = new Entity("window", (game.APP_WIDTH - 651) / 2, (game.APP_HEIGHT - 380) / 2, 0, 0, game.imglib.gui.window);
    wndEntity.draw = function()
    {
        game.drawImage(this.images, this.x, this.y, "source-over");

        game.setText("bold 32px Arial", "center");
        game.drawText(title, this.x + (651 / 2), 70, "#FFFFFF");
    };

    wndEntity.ondrawcontent = function() { };

    wndEntity.onclose = function() { };

    return wndEntity;
}

var game =
{
    APP_NAME: "Project Zero",

    APP_WIDTH: 960,
    APP_HEIGHT: 420,

    APP_VERSION: "'Cloud' (0.1.4)",

    canvas: document.getElementById("canvas"),
    context: this.canvas.getContext("2d"),

    imglib: null,
    soundlib: null,

    activeSound: null,

    flags: [],

    entities: [],

    mouse:
    {
        x: 0,
        y: 0
    },

    world:
    {
        player:
        {
            name: "",

            x: 0,
            y: 0,

            health: 100,

            level: 0,

            money: 0,

            attr:
            {
                attack: 0,
                defence: 0,
                magic: 0
            },

            entity: null,
            stageId: 0
        },

        levels:
            [
                {
                    bgcolor: "#222222",
                    /*bgimg: game.backgrounds.menu,*/

                    gravity: 1.80,
                    blocks:
                        [
                            // Ground
                            new Block(0, 0, 420 - 32, true),
                            new Block(0, 32, 420 - 32, true),
                            new Block(0, 32 * 2, 420 - 32, true),
                            new Block(0, 32 * 3, 420 - 32, true),
                            new Block(0, 32 * 4, 420 - 32, true),
                            new Block(0, 32 * 5, 420 - 32, true),
                            new Block(0, 32 * 6, 420 - 32, true),
                            new Block(0, 32 * 7, 420 - 32, true),
                            new Block(0, 32 * 8, 420 - 32, true),
                            new Block(0, 32 * 9, 420 - 32, true),
                            new Block(0, 32 * 10, 420 - 32, true),
                            new Block(0, 32 * 11, 420 - 32, true),
                            new Block(0, 32 * 12, 420 - 32, true),
                            new Block(0, 32 * 13, 420 - 32, true),
                            new Block(0, 32 * 14, 420 - 32, true),
                            new Block(0, 32 * 15, 420 - 32, true),
                            new Block(0, 32 * 16, 420 - 32, true),
                            new Block(0, 32 * 17, 420 - 32, true),
                            new Block(0, 32 * 18, 420 - 32, true),
                            new Block(0, 32 * 19, 420 - 32, true),
                            new Block(0, 32 * 20, 420 - 32, true),
                            new Block(0, 32 * 21, 420 - 32, true),
                            new Block(0, 32 * 22, 420 - 32, true),
                            new Block(0, 32 * 23, 420 - 32, true),
                            new Block(0, 32 * 24, 420 - 32, true),
                            new Block(0, 32 * 25, 420 - 32, true),
                            new Block(0, 32 * 26, 420 - 32, true),
                            new Block(0, 32 * 27, 420 - 32, true),
                            new Block(0, 32 * 28, 420 - 32, true),
                            new Block(0, 32 * 29, 420 - 32, true),

                            // Air

                            new Block(0, 0, 420 - 32 - 128, true),
                            new Block(0, 32, 420 - 32 - 128, true),
                            new Block(0, 32 * 2, 420 - 32 - 128, true),
                            new Block(0, 32 * 3, 420 - 32 - 128, true),
                            new Block(0, 32 * 4, 420 - 32 - 128, true),
                            new Block(0, 32 * 5, 420 - 32 - 128, true),
                            new Block(0, 32 * 6, 420 - 32 - 128, true),
                            new Block(0, 960 - 32, 420 - 32 - 128, true),
                            new Block(0, 960 - (32 * 2), 420 - 32 - 128, true),
                            new Block(0, 960 - (32 * 3), 420 - 32 - 128, true),
                            new Block(0, 960 - (32 * 4), 420 - 32 - 128, true),
                            new Block(0, 960 - (32 * 5), 420 - 32 - 128, true),
                            new Block(0, 960 - (32 * 6), 420 - 32 - 128, true)
                        ]
                }
            ]
    },

    mouseEvents: [],
    keys: [],

    setColor: function(color)
    {
        game.context.fillStyle = color;
    },

    setText: function(data, align)
    {
        game.context.font = data;
        game.context.textAlign = align;
    },

    drawText: function(text, x, y, color)
    {
        game.setColor(color);
        game.context.fillText(text, x, y);
    },

    fillRect: function(x, y, width, height, color)
    {
        game.setColor(color);
        game.context.fillRect(x, y, width, height);
    },

    fillCircle: function(x, y, radius, color)
    {
        game.context.beginPath();
        game.setColor(color);
        game.context.arc(x, y, radius, 0, Math.PI*2, true);
        game.context.fill();
    },

    drawImage: function(image, x, y, compStyle)
    {
        /*var compositeTypes = [
  'source-over','source-in','source-out','source-atop',
  'destination-over','destination-in','destination-out',
  'destination-atop','lighter','darker','copy','xor'
    ];*/

        game.context.globalCompositeOperation = compStyle;
        game.context.drawImage(image, x, y);

        game.context.globalCompositeOperation = "source-over";
    },

    setWindow: function(window)
    {
        if (game.flags["ACTIVE_WINDOW"] != null)
        {
            game.flags["ACTIVE_WINDOW"].onclose();

            for (var i = 0; i < game.mouseEvents.length; i++)
            {
                if (game.mouseEvents[i].parent == game.flags["ACTIVE_WINDOW"])
                {
                    game.mouseEvents.splice(i, 1);
                }
            }

            game.closeWindow();
        }

        game.flags["ACTIVE_WINDOW"] = window;
    },

    closeWindow: function()
    {
        for (var i = 0; i < game.mouseEvents.length; i++)
        {
            var event = game.mouseEvents[i];
            if (event.parent == game.flags["ACTIVE_WINDOW"])
            {
                game.mouseEvents.splice(i, 1);
            }
        }

        game.flags["ACTIVE_WINDOW"] = null;
    },

    updateCanvas: function()
    {
        game.canvas.width = game.APP_WIDTH;
        game.canvas.height = game.APP_HEIGHT;
    },

    updateMouse: function(e)
    {
        var bounds = game.canvas.getBoundingClientRect();
        game.mouse.x = e.clientX - bounds.left;
        game.mouse.y = e.clientY - bounds.top;
    },

    handleClick: function(e)
    {
        game.updateMouse(e);

        if (!game.focused)
        {
            game.focused = true;
        }

        else if (game.flags["ACTIVE_WINDOW"] != null)
        {
            var buttonX = 749;
            var buttonY = 48;

            if (game.mouse.x > buttonX && game.mouse.x < buttonX + 20)
            {
                if (game.mouse.y > buttonY && game.mouse.y < buttonY + 20)
                {
                    game.flags["ACTIVE_WINDOW"].onclose();

                    for (var i = 0; i < game.mouseEvents.length; i++)
                    {
                        if (game.mouseEvents[i].parent == game.flags["ACTIVE_WINDOW"])
                        {
                            game.mouseEvents.splice(i, 1);
                        }
                    }

                    game.closeWindow();
                }
            }
        }

        else if (game.flags["intro"] != null)
        {
            if (game.flags["intro"].cid < 3)
            {
                clearInterval(game.flags["intro"].timer);
                game.flags["intro"].cid++;
                game.flags["intro"].active = false;
            }
        }

        else if (game.flags["menu"] != null)
        {
            for (var i = 0; i < game.flags["menu"].buttons.length; i++)
            {
                var buttonX = (game.APP_WIDTH - 200) / 2;
                var buttonY = (game.APP_HEIGHT / 2) + (i * 65);

                if (game.mouse.x > buttonX && game.mouse.x < buttonX + 200);
                {
                    if (game.mouse.y > buttonY && game.mouse.y < buttonY + 45)
                    {
                        game.flags["menu"].buttons[i].action();
                    }
                }
            }
        }

        for (var i = 0; i < game.mouseEvents.length; i++)
        {
            var event = game.mouseEvents[i];

            if (game.mouse.x > event.startX && game.mouse.x < event.endX)
            {
                if (game.mouse.y > event.startY && game.mouse.y < event.endY)
                {
                    event.action();
                }
            }
        }
    },

    playSound: function(sound, loop)
    {
        if (game.flags["MUTED"] != null && game.flags["MUTED"] == true) return;

        game.activeSound = sound;
        game.activeSound.loop = loop;

        sound.play();
    },

    stopSound: function()
    {
        if (game.activeSound != null)
        {
            game.activeSound.pause();
            game.activeSound = null;
        }
    },

    showSettings: function()
    {
        var tmpWindow = createWindow("Settings");
        tmpWindow.ondrawcontent = function()
        {
            game.setText("14px Arial", "center");
            game.drawImage(game.imglib.gui.button, this.x + (651 / 2) - 100, this.y + 100, "source-over");
            game.drawText("Mute / Unmute", this.x + (651 / 2), this.y + 125, "#FFFFFF");

        };

        game.setWindow(tmpWindow);

        game.mouseEvents.push
        (
            new MouseEvent
            (
                tmpWindow,
                tmpWindow.x + (651 / 2) - 100,
                tmpWindow.y + 100,
                tmpWindow.x + (651 / 2) - 100 + 200,
                tmpWindow.y + 100 + 45,
                function()
                {
                    game.flags["MUTED"] = !game.flags["MUTED"];

                    if (game.flags["MUTED"]) game.activeSound.pause();
                    else game.activeSound.play();
                }
            )
        );
    },

    start: function()
    {
        game.imglib = new ImageLib();
        game.soundlib = new SoundLib();

        game.updateCanvas();

        game.canvas.addEventListener
        (
            "click",
            function(e) { game.handleClick(e) },
            true
        );

        document.addEventListener
        (
            "keydown",
            function(e) { game.keys[e.keyCode] = true; },
            true
        );

        document.addEventListener
        (
            "keyup",
            function(e) { game.keys[e.keyCode] = false; },
            true
        );

        game.flags["LOADING"] = true;
        game.flags["MUTED"] = false;

        game.gameLoop();
    },

    gameLoop: function()
    {
        requestAnimFrame(game.gameLoop);

        game.update();
        game.render();
    },

    update: function()
    {
        if (game.flags["LOADING"] != null)
        {
            if (game.flags["LOADING"] == false)
            {
                game.flags["intro"] = { "cid": 0, "data": ["Project Zero", "Created by the members of Koodisukka", "Lead by Teemu Pynnönen"], "active": null, "timer": null};
                game.playSound(game.soundlib.sounds.parallelreality, true);

                game.flags["LOADING"] = null;
            }

            else if (game.soundlib.hasError || game.imglib.hasError)
            {
                game.flags["ERROR"] = "Unable to download required game resources!";
            }

            else if (game.imglib.loadedPictures === 18)
            {
                game.flags["LOADING"] = false;
            }
        }

        if (game.flags["intro"] != null)
        {
            if (game.flags["intro"].cid >= 3)
            {
                game.entities = [];

                var window = createWindow("Hello World!");
                window.ondrawcontent = function()
                {
                    game.setText("14px Arial", "left");
                    game.drawText("Welcome!", this.x + 50, this.y + 120, "#FFFFFF");
                    game.drawText("Project Zero is still a unfinished project by the members of Koodisukka.", window.x + 50, window.y + 160, "#FFFFFF");
                    game.drawText("To help us survive the process you can donate any helpful sum of money, so that", window.x + 50, window.y + 180, "#FFFFFF");
                    game.drawText("we can buy a webhost, that would agree to host this brilliant yet not-existant game.", window.x + 50, window.y + 200, "#FFFFFF");
                };

                game.setWindow(window);

                game.flags["intro"] = null;

                game.flags["menu"] =
                {
                    buttons:
                    [
                        {
                            "caption": "Play",
                            "action": function()
                            {
                                var tmpWindow = createWindow("Start Game");
                                tmpWindow.ondrawcontent = function()
                                {
                                    game.setText("14px Arial", "center");
                                    game.drawImage(game.imglib.gui.button, this.x + (651 / 2) - 100, this.y + 150, "source-over");
                                    game.drawText("New Game", this.x + (651 / 2), this.y + 175, "#FFFFFF");
                                    game.drawImage(game.imglib.gui.button, this.x + (651 / 2) - 100, this.y + 225, "source-over");
                                    game.drawText("Load Game", this.x + (651 / 2), this.y + 250, "#FFFFFF");
                                };

                                game.setWindow(tmpWindow);

                                game.mouseEvents.push
                                (
                                    new MouseEvent // New Game
                                    (
                                        tmpWindow,
                                        tmpWindow.x + (651 / 2) - 100,
                                        tmpWindow.y + 150,
                                        tmpWindow.x + (651 / 2) - 100 + 200,
                                        tmpWindow.y + 150 + 45,

                                        function()
                                        {
                                            game.world.player.name = prompt("Enter your character's name");
                                            game.closeWindow();

                                            game.stopSound();
                                            game.playSound(game.soundlib.sounds.complexity, true);

                                            game.flags["menu"] = null;
                                            game.flags["IN_GAME"] = true;

                                            game.entities = [];
                                            var playerEntity = new Entity("player", 255, 255, 0, 0, game.imglib.sprites.humans);

                                            playerEntity.speed = 1.3;
                                            playerEntity.hit = false;

                                            playerEntity.onupdate = function()
                                            {
                                                if (game.keys[87] == true)
                                                {
                                                    if (this.vy == 0)
                                                        this.vy -= 50;
                                                }

                                                if (game.keys[32])
                                                {
                                                    if (!this.hit)
                                                    {
                                                        this.hit = true;
                                                        this.counter = 0;
                                                    }
                                                }
                                                else if (game.keys[65] == true)
                                                {
                                                    this.currentImg = 1;
                                                    this.vx -= this.speed;
                                                }
                                                else if (game.keys[68] == true)
                                                {
                                                    this.currentImg = 0;
                                                    this.vx += this.speed;
                                                }

                                                if (this.hit)
                                                {
                                                    if (this.counter < 5)
                                                    {
                                                        if (this.currentImg == 1) // Left
                                                            this.currentImg = 3;
                                                        else if (this.currentImg == 0)
                                                            this.currentImg = 5;
                                                    }
                                                    else if (this.counter > 25)
                                                    {
                                                        if (this.currentImg == 3) // Left
                                                            this.currentImg = 1
                                                        else if (this.currentImg == 5)
                                                            this.currentImg = 0;

                                                        this.counter = 0;
                                                        this.hit = false;
                                                    }
                                                }
                                            };

                                            game.world.player.entity = playerEntity;

                                            game.entities.push(playerEntity);

                                            game.mouseEvents.push
                                            (
                                                new MouseEvent
                                                (
                                                    null,
                                                    game.APP_WIDTH - 50,
                                                    25,
                                                    game.APP_WIDTH - 50 + 24,
                                                    25 + 24,

                                                    game.showSettings
                                                )
                                            );
                                        }
                                    ),

                                    new MouseEvent // Load Game
                                    (
                                        tmpWindow,
                                        tmpWindow.x + (651 / 2) - 100,
                                        tmpWindow.y + 225,
                                        tmpWindow.x + (651 / 2) - 100 + 200,
                                        tmpWindow.y + 225 + 45,

                                        function()
                                        {
                                            game.closeWindow();
                                        }
                                    )
                                );
                            }
                        },

                        {
                            "caption": "Settings",
                            "action": game.showSettings
                        },

                        {
                            "caption": "Credits",
                            "action": function()
                            {
                                var tmpWindow = createWindow("Credits");
                                tmpWindow.ondrawcontent = function ()
                                {
                                    game.setText("14px Arial", "left");
                                    game.drawText("Project Zero contributors", this.x + 50, this.y + 120, "#FFFFFF");
                                    game.drawText("Teemu Pynnönen (@Bustanity) - Lead Developer", this.x + 50, this.y + 160, "#FFFFFF");
                                    game.drawText("@LolSumor - Graphics Designer", this.x + 50, this.y + 180, "#FFFFFF");
                                };

                                game.setWindow(tmpWindow);
                            }
                        }
                    ]
                };
            }
            else
            {
                if (!game.flags["intro"].active)
                {
                    if (game.entities.length < 20)
                    {
                        for (var i = game.entities.length; i < 20; i++)
                        {
                            var particle = new Particle(Math.random() * game.APP_WIDTH, -50, 20, 0, 1 + Math.random() * 5, randomColor());
                            particle.onupdate = function()
                            {
                                if (this.y > game.APP_HEIGHT + this.radius) game.entities.splice(i, 1);
                            };

                            game.entities.push(particle);
                        }
                    }

                    game.flags["intro"].active = true;
                    game.flags["intro"].timer = setTimeout(function() { game.flags["intro"].cid++; game.flags["intro"].active = false; }, 5000);
                }
            }
        }

        if (game.flags["menu"] != null)
        {
            if (game.flags["menu"].active == null)
            {
                // Create clouds
                if (Math.random() * 3 > 2)
                {
                    var cloudSprite;

                    if (Math.floor(Math.random() * 10001) == 10000)
                    {
                        cloudSprite = 4;
                    }
                    else
                    {
                        cloudSprite = Math.floor(Math.random());
                    }

                    var cloud = new Entity("cloud", -50 - (Math.random() * 50), 5 + (Math.random() * 50), 0.2 + Math.random() * 0.3, 0, game.imglib.sprites.clouds[cloudSprite]);
                    game.entities.push(cloud);
                }

                // Create bird
                var bird = new Entity("bird", -50, 130 - (Math.random() * 100),  0.5 + Math.random() * 1.5, 0, game.imglib.sprites.bird);
                bird.counter = 0;

                bird.onupdate =
                    function()
                    {
                        if (this.counter < 30) this.currentImg = 0;
                        else this.currentImg = 1;
                    };

                game.entities.push(bird);
                game.flags["menu"].active = setTimeout(function() {game.flags["menu"].active = null}, 10000);
            }
        }
        else if (game.flags["IN_GAME"] != null)
        {
            if (game.world.player.health < 1)
            {
                game.flags["IN_GAME"] = null;

                var tmpWindow = createWindow("Game Over");
                tmpWindow.ondrawcontent = function()
                {
                    game.setText("14px Alias", "left");
                    game.drawText("Seems like it is game over for you, " + game.world.player.name + ".", this.x + 50, this.y + 120, "#FFFFFF");
                };

                tmpWindow.onclose = function()
                {
                    game.flags["intro"] = true;
                };

                game.setWindow(tmpWindow);

                return;
            }
        }

        if (game.flags["STOP_SOUND"] != null)
        {
            game.stopSound();
        }

        for (var i = 0; i < game.entities.length; i++)
        {
            var entity = game.entities[i];

            entity.onupdate();
            entity.counter++;

            if (entity.counter > 60) entity.counter = 0;

            if (entity.radius == null && entity.friction != null) // Not a particle
            {
                entity.vx *= entity.friction;
                entity.vy *= entity.friction;
            }

            entity.x += entity.vx;
            entity.y += entity.vy;

            if (game.flags["IN_GAME"])
            {
                var collides = false;

                var level = game.world.levels[game.world.player.stageId];
                for (var i = 0; i < level.blocks.length; i++)
                {

                    var block = level.blocks[i];
                    if (block.collides(entity))
                    {
                        if (entity.vy > 0)
                        entity.vy = 0;
                        collides = true;
                    }
                }

                if (!collides)
                {
                    entity.vy += level.gravity;
                }
            }

            if (entity.x < -500 || entity.x > game.APP_WIDTH + 500) game.entities.splice(i, 1);
            if (entity.y < -500 || entity.y > game.APP_HEIGHT + 500) game.entities.splice(i, 1);
        }
    },

    render: function()
    {
        game.fillRect(0, 0, game.APP_WIDTH, game.APP_HEIGHT, "#000000");

        if (game.flags["ERROR"] != null)
        {
            game.setText("bold 32px Arial", "center");
            game.drawText(game.APP_NAME + ": " + game.flags["ERROR"], game.APP_WIDTH / 2, game.APP_HEIGHT / 2, "#FF0000");
            return;
        }

        else if (game.flags["LOADING"] != null)
        {
            game.setText("bold 32px Arial", "center");
            game.drawText(game.APP_NAME + ": Loading", game.APP_WIDTH / 2, game.APP_HEIGHT / 2, "#FFFFFF");
        }

        else if (game.flags["intro"] != null)
        {
            for (i = 0; i < game.entities.length; i++)
            {
                game.entities[i].draw();
            }

            var str = game.flags["intro"].data[game.flags["intro"].cid];

            if (str != null)
            {
                game.setText("bold 32px Arial", "center");
                game.drawText(str, game.APP_WIDTH / 2, game.APP_HEIGHT / 2, "#FFFFFF")
            }
        }

        else if (game.flags["menu"] != null)
        {
            game.drawImage(game.imglib.backgrounds.menu, 0, 0, "source-over");

            for (i = 0; i < game.entities.length; i++)
            {
                game.entities[i].draw();
            }

            game.drawImage(game.imglib.gui.logo, (game.APP_WIDTH - game.imglib.gui.logo.width) / 2, 50, "source-over");

            game.setText("bold 21px Arial", "center");
            for (var i = 0; i < game.flags["menu"].buttons.length; i++)
            {
                var button = game.flags["menu"].buttons[i];

                var x = (game.APP_WIDTH - 200) / 2;
                var y = (game.APP_HEIGHT / 2) + (i * 65);

                game.drawImage(game.imglib.gui.button, x, y, "source-over");

                game.drawText(button.caption, x + (200 / 2), y + (55 / 2), "#FFFFFF");
            }
        }
        else if (game.flags["IN_GAME"] != null)
        {
            var stage = game.world.levels[game.world.player.stageId];
            game.fillRect(0, 0, game.APP_WIDTH, game.APP_HEIGHT, stage.bgcolor);

            //game.drawImage(stage.bgimg, 0, 0);

            game.setText("bold 18px Arial", "center");
            game.drawText("Use WASD keys to move, spacebar to hit", game.APP_WIDTH / 2, 100, "#FFFFFF");

            for (var i = 0; i < stage.blocks.length; i++)
            {
                stage.blocks[i].draw();
            }

            for (var i = 0; i < game.entities.length; i++)
            {
                game.entities[i].draw();
            }

            game.drawImage(game.imglib.gui.playerbar, 40, 15, "source-over");

            game.setText("bold 13px Arial", "center");
            game.drawText(game.world.player.name, 57 + (181 / 2), 43, "#FFFFFF");

            game.fillRect(60 + (181 - 104) / 2, 50, 104, 18, "#FFFFFF");
            game.fillRect(59 + (183 - 100) / 2, 52, game.world.player.health, 14, "#FF0000");

            game.drawText(game.world.player.health + " / 100", 57 + (181 / 2), 52 + (22 / 2), "#000000");

            game.drawImage(game.imglib.gui.settings, game.APP_WIDTH - 50, 25, "source-over");
        }

        if (game.flags["ACTIVE_WINDOW"] != null)
        {
            game.flags["ACTIVE_WINDOW"].draw();
            game.flags["ACTIVE_WINDOW"].ondrawcontent();
        }

        game.setText("10px Arial", "center");
        game.drawText("Version: " + game.APP_VERSION, game.APP_WIDTH - 85, game.APP_HEIGHT - 25, "#FFFFFF");
    }
};

game.start();