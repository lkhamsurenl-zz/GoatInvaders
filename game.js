;(function() {
//******************************************************************************
// constructor for the game
//******************************************************************************
    var Game = function(canvasId) {
        var canvas = document.getElementById(canvasId);
        // Canvas context
        var screen = canvas.getContext("2d");
        var gameSize = {x: canvas.width, y: canvas.height };

        // bodies in the game
        this.bodies = createInvaders(this).concat(new Player(this, gameSize));
        var self = this;
        // Play sound upon loading
        //loadSound("shoot.wav", function(shootSound) {
        //    self.shootSound = shootSound;
            var tick = function() {
                // update current screen
                self.update();
                // draw new image on the screen
                self.draw(screen, gameSize);
                requestAnimationFrame(tick);
            };
            // tick current canvas
            tick();
        //});
    };

    //Prototype for the game
    Game.prototype = {
        update: function() {
            var bodies = this.bodies;
            var notCollidingWithAnything = function(body1) {
                return bodies.filter(function(body2) {
                    return colliding(body1, body2);}).length === 0;
            };

            // update the game by deleting all colliding bodies from the game
            // NOTE: filter is the built-in function
            this.bodies = this.bodies.filter(notCollidingWithAnything);
            //console.log("hi");
            for (var i=0; i < this.bodies.length; i++) {
                // draw all the bodies
                this.bodies[i].update();
            }
        },

        draw: function(screen, gameSize) {
            // Clear the screen to make sure only one instance of the player drew
            screen.clearRect(0, 0, gameSize.x, gameSize.y);
            // Draw a rectangle on the screen
            for (var i=0; i < this.bodies.length; i++) {
                // draw all the bodies
                drawRect(screen, this.bodies[i]);
            }
        },

        // Add Given body to the game
        addBody: function(body) {
            this.bodies.push(body);
        },

        // figures out if there is any goat below given one
        invadersBelow: function(invader) {
            return this.bodies.filter(function(body) {
                return body instanceof Invader &&
                    body.center.y > invader.center.y &&
                    body.center.x - invader.center.x < invader.size.x;
            }).length > 0;
        }
    };

    //******************************************************************************
    // constructor for the Player
    //******************************************************************************
    // @Game - Current game
    // @gameSize - size of the game
    var Player = function(Game, gameSize) {
        // Save the game
        this.game = Game
        // size of the player
        this.size = {x: 15, y : 15};
        //center of the player on x axis, and near bottom in y axis
        this.center = {x: gameSize.x /2, y: gameSize.y  - this.size.y/2 };
        // Keyboarder
        this.keyboarder = new Keyboarder();
    };
    // Player prototype:
    Player.prototype = {
        // Player updates itself on this function
        update: function () {
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                // move left
                this.center.x -= 2;
            }
            else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                // move left
                this.center.x += 2;
            }
            else if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
                // Create the bullets
                var bullet = new Bullet( {x: this.center.x, y: this.center.y - this.size.y / 2},
                                         {x: 0, y : -6});
                // add bullet into the game bodies
                this.game.addBody(bullet);
                // Play sound
                //this.game.shootSound.load();
                //this.game.shootSound.play();
            }
        }
    };
    //******************************************************************************
    // Bullet
    //******************************************************************************
    // @center - center of the bullet
    // @velocity -
    var Bullet = function(center, velocity) {
        // size of the bullet
        this.size = {x: 3, y : 3};
        //center of the bullet relative to the game screen
        this.center = center;
        this.velocity = velocity;

    };
    // Player prototype:
    Bullet.prototype = {
        // Player updates itself on this function
        update: function () {
            // bullets location change by velocity
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    };

    //******************************************************************************
    // Invaders
    //******************************************************************************
    // Constructor for the invaders
    // @Game - Current game
    // @gameSize - size of the game
    var Invader = function(Game, center) {
        // Save the game
        this.game = Game
        // size of the player
        this.size = {x: 15, y : 15};
        //center of the player relative to the game screen
        this.center = center;
        // Relative patrol position
        this.patrolX = 0;
        // x-velocity
        this.velocityX = 0.3;
    };

    // Invaders prototype:
    Invader.prototype = {
        // Player updates itself on this function
        update: function () {
            // Check the boundary
            if(this.patrolX < 0 || this.patrolX > 40) {
                // Turn back
                this.velocityX = - this.velocityX;
            }
            // update variables
            this.center.x += this.velocityX;
            this.patrolX += this.velocityX;

            // Fire bullets time to time, only if there is no goat below
            if(Math.random() > 0.995 && !this.game.invadersBelow(this)) {
                // Create the bullets with center, velocity
                var bullet = new Bullet( {x: this.center.x, y: this.center.y + this.size.y/2},
                                         {x: Math.random() - 0.5, y : 2});
                // add bullet into the game bodies
                this.game.addBody(bullet);
            }
        }
    };

    var createInvaders = function(game) {
        var invaders = [];
        for (var i=0; i < 24; i++) {
            var x = 30 + (i % 8) * 30;
            var y = 30 + (i % 3) * 30;
            invaders.push(new Invader(game, {x: x, y: y}));
        }
        return invaders
    }


    //******************************************************************************
    // Helper function
    //******************************************************************************

    // drawRect function to draw bodies
    var drawRect = function(screen, body) {
        // Draws rectangle with (x, y, width, height)
        screen.fillRect(body.center.x - body.size.x/2,
                        body.center.y - body.size.y/2,
                        body.size.x, body.size.y);
    };

    // Bind events of keyboard
    var Keyboarder = function() {
        // Collect key state
        var KeyState = {};

        window.onkeydown = function(e) {
            KeyState[e.keyCode] = true;
        };
        window.onkeyup = function(e) {
            KeyState[e.keyCode] = false;
        };
        // Helper function to figure out if the key state is down
        this.isDown = function(keyCode) {
            return KeyState[keyCode] === true;
        };
        // Key codes for the keyboard events
        this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
    };

    // detect collision by checking if there is any overlap
    var colliding = function(body1, body2) {
        return !(body1 === body2 ||
                 body1.center.x + body1.size.x/2  < body2.center.x - body2.size.x/2 ||
                 body1.center.x - body1.size.x/2  > body2.center.x + body2.size.x/2 ||
                 body1.center.y + body1.size.y/2  < body2.center.y - body2.size.y/2 ||
                 body1.center.y - body1.size.y/2  > body2.center.y + body2.size.y/2);
    };

    // play sound
    // @url - url to play sound
    var loadSound = function(url, callback) {
        var loaded = function() {
            callback(sound);
            sound.removeEventListener('canplaythrough', loaded);
        };
        var sound = new Audio(url);
        // We add listener when the sound is fully loaded
        sound.addEventListener('canplaythrough', loaded);
        sound.load();
    };

    // Bind to the callback
    window.onload = function() {
        // new game with the current screen
        new Game("screen");
    };
})();
