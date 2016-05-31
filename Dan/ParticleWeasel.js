/**
 * Created by Andy on 5/8/2016.
 */
$(document).ready(function () {
    //Variables for overlap()
    var aMaxX = 0;
    var aMaxY = 0;
    var bMaxX = 0;
    var bMaxY = 0;

    //Canvas
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

    //Audio variables
    var aud = new Audio("theme.mp3");
    aud.volume = 0.1;
    var audPower = new Audio("Powerup12.wav");
    audPower.volume = 0.2;
    var pauseMusic = false;

    //----------------------Randomly selecting power up Partcles----------------------------------
    //-----------------------------------------------------------------------

    var initialParticles = new Array();
    var powerParticles = new Array();
    initialParticles.push("./images/Particle1.png");
    initialParticles.push("./images/Particle3.png");
    initialParticles.push("./images/Particle4.png");
    initialParticles.push("./images/Particle2.png");
    initialParticles.push("./images/Particle7.png");
    initialParticles.push("./images/Particle8.png");
    initialParticles.push("./images/Particle9.png");
    initialParticles.push("./images/Particle10.png");
    initialParticles.push("./images/Particle12.png");
    initialParticles.push("./images/Particle13.png");

    for(var i = 0; i < 3; i++){
        p = Math.round(Math.random()*(initialParticles.length-1));
        powerParticles.push(initialParticles[p]);
        initialParticles.splice(p, 1);
    }
  
    //----------------------Images----------------------------------
    //-----------------------------------------------------------------------
    //Source image array
    var sources = {
        NewGame: "./images/NewGame.png",
        StartGame: "./images/StartGame.png",
        StartScreen: "./images/StartScreen.png",
        MainMenu: "./images/MainMenu.png",
        ResumeGame: "./images/ResumeGame.png",
        Weasel: "./images/WeaselOpen.png",
        Background: "./images/Background.png",
        Proton: "./images/Particle6.png",
        Powerup1: powerParticles[0],
        Powerup2: powerParticles[1],
        Powerup3: powerParticles[2],
        Obstacle: "obstacle",
        array: []
    }

    //Push initial particles for use in sources.array
    for(var i = 0; i < initialParticles.length; i++){
        sources.array.push(initialParticles[i]);
    }

    //----------------------Mouse/Keyboard Functions----------------------------------
    //-----------------------------------------------------------------------

    //Input variables
    var event;
    var mousePos;
    var mouseDowned = false;
    keysDowned = [];

    $(document).mousedown(function(e) {
    mouseDowned = true;
    })

    $(document).mouseup(function(e) {
    mouseDowned = false;
    })

    $(document).mousemove(function(e) {
    event = e;
    })

    $(document).keydown(function(e){
        if (e.which == 32) {
            switch(pauseMusic) {
                case false:
                    pauseMusic = true;
                    break;
                case true:
                    pauseMusic = false;
                    break;
            }
        }
        for (var i in keysDowned) {
            if (keysDowned[i] == e.which) return;
        }
        keysDowned.push(e.which);
    })

    $(document).keyup(function(e) {
        for (var i in keysDowned) {
            if (keysDowned[i] == e.which) {
                keysDowned.splice(i,1);
            }
        }
    })

    //Call with global event variable
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
 
    //----------------------Gamepad Functions--------------------------------
    //-----------------------------------------------------------------------
    //Mostly taken from:
    //http://gamedevelopment.tutsplus.com/tutorials/using-the-html5-gamepad-api-to-add-controller-support-to-browser-games--cms-21345

    //Gamepad Variables
    var useCon = false;
    var gp;
    var hasGP = false;
    var repGP;

    function canGame() {
        return "getGamepads" in navigator;
    }

    function reportOnGamepad() {
        gp = navigator.getGamepads()[0];
        var html = "";
            html += "id: "+gp.id+"<br/>";
 
        //$("#gamepadDisplay").html(html);
    }

    if(canGame()) {
        var prompt = "To begin using your gamepad, connect it and press any button!";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function() {
            hasGP = true;
            $("#gamepadPrompt").html("Gamepad connected!");
            console.log("connection event");
            repGP = window.setInterval(reportOnGamepad,1);
        });

        $(window).on("gamepaddisconnected", function() {
            hasGP = false;
            console.log("disconnection event");
            $("#gamepadPrompt").text(prompt);
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
            console.log(checkGP);
            if(navigator.getGamepads()[0]) {
                if(!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }


//----------------------Game State-----------------------------------
//-----------------------------------------------------------------------
    function gameState(){
        this.onGoing = true;
        this.win = false;
        this.lose = false;
    }
    state = new gameState();
//----------------------Sprite Function----------------------------------
//-----------------------------------------------------------------------

//Use Sprite.call(this); and .prototype = new Sprite(); to inherit the sprite class.
    function Sprite() {
    this.image = new Image();
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;
    this.name = "Unnamed";
    this.children = [];
    }

    Sprite.prototype.setSrc = function(src) {
        this.image.src = src;
    }

    //Ham-fistedly puts x and y in the center
    Sprite.prototype.center = function() {
        this.x = this.x-this.width/2;
        this.y = this.y-this.height/2;
    }

    Sprite.prototype.uncenter = function() {
        this.x = this.x+this.width/2;
        this.y = this.y+this.height/2;
    }

    //If you override, keep this.drawChildren();
    Sprite.prototype.draw = function() {
        //console.log("drawing"+this.image.src);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.drawChildren();
    };

    Sprite.prototype.update = function() {
        this.updateChildren();
    }

    Sprite.prototype.addChild = function(child) {
        this.children.push(child);
    }

    Sprite.prototype.drawChildren = function() {
        for (var i in this.children) {
            this.children[i].draw();
        }
    }

    Sprite.prototype.updateChildren = function() {
        for (var i in this.children) {
            this.children[i].update();
        }
    }


//----------------------Menu System Functions---------------------------
//----------------------------------------------------------------------
    //A viewed game state
    function Screen(alwaysUpdate, alwaysDraw){
        Sprite.call(this);

        //Boolean
        this.alwaysUpdate = alwaysUpdate;
        this.alwaysDraw = alwaysDraw;

        this.stage = new Sprite();

        this.initialized = false;
    }
    Screen.prototype = new Sprite();

    Screen.prototype.init = function(){
    }

    //Needed because inheriting from sprite apparently doesn't work right in Firefox
    Screen.prototype.draw = function() {
        this.drawChildren();
    }

    //Object holding Screens
    function ScreenManager(){
        Sprite.call(this);

        this.screens = [];
    }
    ScreenManager.prototype = new Sprite();

    ScreenManager.prototype.push = function(screen){
        for (var i in this.screens) {
            if (this.screens[i] == screen) {
                this.screens[i].initialized = false;
                this.screens[i].children = [];
                this.screens.splice(i,1);
            }
        }
        this.screens.push(screen);
    }

    ScreenManager.prototype.pop = function(){
        return this.screens.pop();
    }

    ScreenManager.prototype.remove = function(screen){
        for (var i in this.screens) {
            if (this.screens[i] == screen) {
                this.screens[i].initialized = false;
                this.screens[i].children = [];
                this.screens.splice(i,1);
            }
        }
    }

    ScreenManager.prototype.update = function(){
        var screens = this.screens;

        for(var i in screens){

            if(screens[i].alwaysUpdate || screens[i] == screens[screens.length-1]){
                if(!screens[i].initialized){
                    screens[i].init();
                    screens[i].initialized = true;
                }
                screens[i].update();
            }
        }
    }

    ScreenManager.prototype.draw = function(){
        var screens = this.screens;

        for(var i in screens){

            if(screens[i].alwaysDraw || screens[i] == screens[screens.length-1]){
                screens[i].draw();
            }
        }
    }



//----------------------Menu System Implementaton-----------------------
//----------------------------------------------------------------------
    var screenMan = new ScreenManager();

    //----Main Menu-----------------\\
    var menu = new Screen(false,false);
    screenMan.push(menu);
    menu.init = function() {
        
        //Menu background w/ controls
        control = new Sprite();
        control.setSrc(sources.StartScreen);
        control.width = w;
        control.height = h;
        control.x = 0;
        control.y = 0;
        this.addChild(control);

        //console.log("initializing");
        var newGame = new Sprite();
        newGame.name = "New Game"
        newGame.image = new Image();
        //console.log(sources.NewGame);
        newGame.image.src = sources.StartGame;
        newGame.width = 224;
        newGame.height = 34;
        newGame.x = canvas.width/2;
        newGame.y = canvas.height/2 - 54;
        newGame.center();
        this.addChild(newGame);
    }
    menu.update = function() {
        if(clicked(this.children[1])) {
            screenMan.push(tutScreen);
        }
        if(hasGP) {
            if(gp.buttons[0].pressed){
                useCon = true;
                screenMan.push(tutScreen);
            }
        }
    }
    menu.draw = function() {
        this.drawChildren();
    }

    //----Introduction Level-----------------\\
    var tutScreen = new Screen(true,true);
    tutScreen.init = function() {
        console.log("initializing");
        var background = new Sprite();
        background.setSrc(sources.Background);
        background.width = w;
        background.height = h;
        this.addChild(background);

        this.addChild(weasel);
        protonArray = [];
        protonCount = 1;
        createProtons("left");
        createProtons("right");
        explosion = [];
        partObstacles = [];
    }
    tutScreen.update = function() {
        //console.log('calling');
        for(i in protonArray){
            protonArray[i].update();
        }
        for(i in explosion){
            explosion[i].update();
        }
        this.updateChildren();
    }
    tutScreen.draw = function() {
        this.drawChildren();
        for(i in partObstacles){
            partObstacles[i].draw();
        }
        for(i in protonArray){
            protonArray[i].draw();
        }
        for(i in explosion){
            explosion[i].draw();
        }
        ctx.save();
        ctx.fillStyle = "red";
        ctx.font = "48px Serif";
        ctx.fillText("The Protons Love Each Other", w/2, 50);
        ctx.restore();
    }

    //----Game Screen-----------------\\
    var gameScreen = new Screen(true, true);

    gameScreen.init = function() {

        var background = new Sprite();
        background.setSrc(sources.Background);
        background.width = w;
        background.height = h;
        this.addChild(background);

        this.addChild(weasel);
        createObstacles(100, true);
        protonArray = [];
        protonCount = 1;
        createProtons("left");
        createProtons("right");
        for (var i in protonArray) {
            protonArray[i].init();
        }
        explosion = [];
    }
    gameScreen.update = function() {
        for(i in partObstacles){
            partObstacles[i].update();
        }

        for(i in protonArray){
            protonArray[i].update();
        }
        for(i in explosion){
            explosion[i].update();
        }
        for(i in weasel.eaten){
          weasel.eaten[i].width = 50;
          weasel.eaten[i].height = 50;
          if(i == 0){
            weasel.eaten[i].x = 10;
            weasel.eaten[i].y = h-50;
          }else{
            weasel.eaten[i].x = 60;
            weasel.eaten[i].y = h-50;
          }
        }
        this.updateChildren();
    }
    gameScreen.draw = function() {
        this.drawChildren();
        for(i in partObstacles){
            partObstacles[i].draw();
        }
        for(i in protonArray){
            protonArray[i].draw();
        }
        for(i in explosion){
            explosion[i].draw();
        }

        //Display visual of eaten particle array
        /*ctx.fillRect(0, h - 50, w, h);
        for(i in weasel.eaten){
          weasel.eaten[i].draw();
        
        }
        */

    }

    //----Pause Menu-----------------\\
    var pauseScreen = new Screen(false, false);
    pauseScreen.init = function() {
        var main = new Sprite();
        //console.log(sources.MainMenu);
        main.setSrc(sources.MainMenu);
        main.width = 230;
        main.height = 34;
        main.x = canvas.width/2;
        main.y = canvas.height/2 + 54;
        main.center();
        this.addChild(main);

        var resume = new Sprite();
        //console.log(sources.ResumeGame);
        resume.setSrc(sources.ResumeGame);
        resume.width = 296;
        resume.height = 34;
        resume.x = canvas.width/2;
        resume.y = canvas.height/2;
        resume.center();
        this.addChild(resume);
    }

    pauseScreen.update = function() {
        if(clicked(this.children[0])) {
            screenMan.remove(tutScreen);
            screenMan.remove(gameScreen);
            screenMan.push(menu);
        }
        if (clicked(this.children[1])) {
            screenMan.pop(this);
        }
        if(hasGP) {
            if(gp.buttons[1].pressed){
                useCon = true;
                screenMan.remove(tutScreen);
                screenMan.push(gameScreen);
                screenMan.push(menu);
            } else if(gp.buttons[0].pressed) {
                useCon = true;
                screenMan.pop(this);
            }
        }

    }

    //-------Post-Explosion screen-------\\
    var scoreScreen = new Screen(false, false);
    scoreScreen.init = function() {
        var nextLevel = new Sprite();
        nextLevel.setSrc(sources.NewGame);
        nextLevel.width = 224;
        nextLevel.height = 34;
        nextLevel.x = canvas.width/2;
        nextLevel.y = canvas.height/2;
        nextLevel.center();
        this.addChild(nextLevel);
    }

    scoreScreen.update = function() {
        if(clicked(this.children[0])) {
            screenMan.remove(tutScreen);
            screenMan.push(gameScreen);
        }
        if(hasGP) {
            if(gp.buttons[0].pressed){
                useCon = true;
                screenMan.remove(tutScreen);
                screenMan.push(gameScreen);
            }
        }
    }

//----------------------Obstacle particle system-------------------------
//-----------------------------------------------------------------------
    var partObstacles = new Array();
    function Particle(lifeTime, speed, x, y, period, color, radius, type) {
        Sprite.call(this);
        this.lifeTime = lifeTime;
        this.speed = speed;
        this.width = radius*2;
        this.height = radius*2;
        this.x = x;
        this.y = y;
        this.period = period;
        this.color = color;
        this.radius = radius;
        this.running = false;
        this.type = type;
        this.xspeed = speed * Math.cos(period);
        this.yspeed = speed * Math.sin(period);
        this.style = Math.floor(Math.random()*2);
        this.angle = 0;

        if(this.type == "obstacle") {
            this.type = Math.floor(Math.random()  * 7);
            this.image.src = sources.array[this.type];
        } else {
            //console.log(this.type);
            this.image.src = sources[this.type];
        }


        if(this.type === "Powerup1" || this.type === "Powerup2" || this.type === "Powerup3"){
            this.width *= 3;
            this.height *= 3;
            this.speed *= 2;
            this.xspeed *= 2;
            this.yspeed *= 2;
        }

        this.float = function() {
            if (this.x > 0 && this.period >= 0) {
                this.x -= this.speed;
                this.y += this.speed * .3;
                this.period--;
                if (this.period == 0) {
                    this.period = -10;
                }
            } else if (this.x > 0 && this.period < 0) {
                this.x -= this.speed;
                this.y -= this.speed * .3;
                this.period++;
                if (this.period == 0) {
                    this,period = 10;
                }
            } else {
                this.x = h;
                this.y = Math.random() * w;
                this.period = 10;
            }
        }

        this.drift = function() {
            //past lower part and moving down
            if(this.y > canvas.height && this.yspeed > 0){
                //this.x = Math.random() * canvas.width();
                this.period = Math.random() * 90;
                this.yspeed *= -1;
            }
            //past upper part and moving up
            else if(this.y < 0 && this.yspeed < 0){
                //this.x = Math.random() * canvas.width();
                this.period = Math.random() * 90;               
                this.yspeed *= -1;
            }
            //x equivalents
            else if(this.x > canvas.width && this.xspeed > 0){
                //this.y = Math.random() * canvas.height();
                this.period = Math.random() * 90;
                this.xspeed *= -1;
            }
            else if(this.x < 0 && this.xspeed < 0){
                //this.y = Math.random() * canvas.height();
                this.period = Math.random() * 90;
                this.xspeed *= -1;
            }
            else{
                this.x += this.xspeed;
                this.y += this.yspeed;
                
            }
        }
    }

    Particle.prototype = new Sprite();

    Particle.prototype.update = function() {
        //console.log(this.running);
        if(!weasel.forcePush) this.running = false;
        if(this.running) {
            this.moveAway(weasel);
        } else {
            if(this.style == 0) {
                this.drift();
            } else {
                this.float();
            }
        }
    }

/*    Particle.prototype.draw = function() {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
            this.drawChildren();
        }*/

    Particle.prototype.moveTowards = function (Coord){
            diffX = Coord.x - this.x;
            diffY = Coord.y - this.y;
            //console.log("x = " + Coord.x);
            //console.log("y = " + Coord.y);
            this.angle = Math.atan2(diffY, diffX)*180 / Math.PI;
            this.x += Math.cos(this.angle * Math.PI/180) * this.speed;
            this.y += Math.sin(this.angle * Math.PI/180) * this.speed;
        }

    Particle.prototype.moveAway = function (Coord){
            diffX = Coord.x - this.x;
            diffY = Coord.y - this.y;
            //console.log("x = " + Coord.x);
            //console.log("y = " + Coord.y);
            this.angle = Math.atan2(diffY, diffX)*180 / Math.PI;
            this.x += Math.cos(this.angle * Math.PI/180) * -this.speed*2;
            this.y += Math.sin(this.angle * Math.PI/180) * -this.speed*2;
        }

    Particle.prototype.move = function () {
        this.x += Math.cos(this.angle * Math.PI/180) * this.speed;
        this.y += Math.sin(this.angle * Math.PI/180) * this.speed;
    }

    //Called in game screen init.
    function createObstacles(numObstacles, reset) {
        var type;
        if(reset)partObstacles = [];
        for(var i = 0; i < numObstacles; i++){
            type = Math.floor(Math.random() * 40);
            if (type < 3) {
                type = Math.floor(Math.random() * 3);
               // console.log("Lessthan3:"+type);
                switch(type) {
                    case 0:
                        type = "Powerup1";
                        break;
                    case 1:
                        type = "Powerup2";
                        break;
                    case 2:
                        type = "Powerup3";
                        break;
                }
            } else type = "obstacle";
            partObstacles.push(new Particle(Math.random()*10, 5 - Math.random()*4,
                Math.random()*w, Math.random()*h, 10, "red",5, type))
        }
    }


//----------------------Proton "System"---------------------------------
//----------------------------------------------------------------------

    var protonArray = [];
    protonCount = 1;
    function Proton(x, y, speed, side, radius, target){
        Sprite.call(this);
        this.x = x;
        this.y = y;
        this.width = radius*2;
        this.height = radius*2;
        this.speed = 10;
        this.side = side;
        this.radius = radius;
        this.target = target
        this.image.src=sources.Proton;
        this.array = [];
        this.angle = 0;
    }

    Proton.prototype = new Particle();

    Proton.prototype.init = function() {
        if (this.side == "left") {
            this.x = 0;
            this.y = h/4;
        } else {
            this.x = w-50;
            this.y = 3*(h/4);
            this.angle = 180;
        }
    }

    Proton.prototype.update = function () {
        if(weasel.followPower == true){
          //console.log(distance(this,weasel));
          //console.log(distance(partObstacles[this.target], weasel));
            if(distance(this, weasel) < 500 && distance(protonArray[this.target], this) > 150){
                this.speed = Math.abs(this.speed);
                this.moveTowards(weasel);
            } else if(distance(protonArray[this.target], this) < 150){
                this.speed = Math.abs(this.speed);
                this.moveTowards(protonArray[this.target]);
            }else{
                this.move(this.angle);
            }
        }
        if(protonArray.length == 2 && !weasel.followPower){
            //this.moveTowards(protonArray[this.target]);
            this.move();
        }
        if(weasel.forcePush) {
            for(i in partObstacles){
                if(distance(weasel, partObstacles[i]) < 200) {
                    partObstacles[i].running = true;
                }
            }
        }

        if(weasel.speedPower) {
            this.speed = 20;
        } else this.speed = 10;

        if(this.overlap(this, protonArray[this.target])){
            makeExplosion((weasel.score/100) + 40);
            audPower.play();
            protonArray = [];
            protonCount = 1;
            weasel.init();
            gameScreen.children.pop();
            tutScreen.children.pop();
            screenMan.push(scoreScreen);
        }
       for(i in partObstacles){
            if(this.overlap(this, partObstacles[i])){
                this.angle += Math.random()*720;
            }
        }
        if(this.x <= 0 || this.x+this.width >= w || this.y <= 0 || this.y+this.height >= h) {
            this.speed *= -1;
        }
    }


    Proton.prototype.overlap = function (a, b) {
        aMaxX = a.x //+ a.width;
        aMaxY = a.y //+ a.height;
        bMaxX = b.x //+ b.width;
        bMaxY = b.y //+ b.height;

        if (aMaxX < b.x-a.width/2 || a.x-(a.width/2) > bMaxX) return false;
        if (aMaxY < b.y-a.height/2 || a.y-(a.height/2) > bMaxY) return false;

        return true;
    }

    //Called in game screen init
    function createProtons(side){
        if(side == "left"){
            protonArray.push(new Proton(0, h/2 ,2, "left", 25, protonCount));
        }
        if(side == "right"){
            protonArray.push(new Proton(w-60, h/2 ,2, "right", 25, protonCount));
        }
        protonCount--;
    }


//----------------------Particle System for Win Condition--------------
//--------------------------------------------------------------------------
    var explosion = [];
    function explosionParticle(x, y, radius, vSpeed, hSpeed, speed){
        Sprite.call(this);
        this.x = x;
        this.y = y;
        this.width = radius*2;
        this.height = radius*2;
        this.radius = radius;
        this.vSpeed = vSpeed;
        this.hSpeed = hSpeed;
        this.image.src = sources.array[Math.floor(Math.random()  * 7)];
        this.speed = Math.random()*17 + 10;
    }

    explosionParticle.prototype = new Particle();

    explosionParticle.prototype.update = function(){
      this.x += this.hSpeed*this.speed;
      this.y += this.vSpeed*this.speed;
    }

    function makeExplosion(numParticles){
        explosion = [];
        for (var i = 0; i < numParticles; i++) {

        explosion.push(new explosionParticle(protonArray[1].x, protonArray[1].y, 15, Math.sin(i), Math.cos(i)));
        }
    }

//----------------------PowerUp Timer---------------------------------
//----------------------------------------------------------------------------

    var followPowerTime;
    var pushPowerTime;
    var speedPowerTime;


//----------------------Weasel Implementation---------------------------------
//----------------------------------------------------------------------------
    var weasel = new Sprite();
    weasel.image = new Image();
    weasel.setSrc(sources.Weasel);
    weasel.x = canvas.width/2;
    weasel.y = canvas.height/2;
    weasel.center();
    weasel.speed = .1;
    weasel.accel = 1.25;
    weasel.stopped = true;
    weasel.eaten = [];
    weasel.numEaten = 0;
    weasel.followPower = false;
    weasel.forcePush = false;
    weasel.speedPower = false;
    weasel.angle = 0;
    weasel.score = 5000;

    weasel.init = function() {
        this.followPower = false;
        this.forcePush = false;
        this.speedPower = false;
        this.score = 0;
    }

    weasel.update = function() {
        if(this.eaten.length == 2){
            particle0 = this.eaten[0].type;
            particle1 = this.eaten[1].type;

            if(particle0 == "Powerup1" || particle1 == "Powerup1"){
                this.followPower = true;
                this.score += 100;
                followPowerTime = setTimeout(function() {setFollowFalse();}
                                  ,5000); //5sec
            }

            if(particle0 == "Powerup3" || particle1 == "Powerup3"){
                this.forcePush = true;
                this.score += 100;
                pushPowerTime = setTimeout(function() {setPushFalse();}
                                ,5000);
            }

            if(particle0 == "Powerup2" || particle1 == "Powerup2"){
                this.speedPower = true;
                //this.speed = this.speed*2;
                this.score += 100;
                speedPowerTime = setTimeout(function() {setSpeedFalse();}
                                ,5000);
            }
        }else this.init;
        for(i in partObstacles){
            if(overlap(this, partObstacles[i])){
                //console.log(partObstacles[i].type);
                if(this.eaten.length < 2){
                    this.score += 5;
                    this.eaten.push(partObstacles[i]);
                } else if(this.eaten.length = 2){
                    this.score += 5;
                    this.eaten.pop();
                    this.eaten.unshift(partObstacles[i]);
                }
                partObstacles.splice(i,1);
                createObstacles(1, false);
            }
        }

        if (mouseDowned) {
            useCon = false;
            if (this.stopped) {
                this.stopped = false;
                this.speed = .5;
            }
        }
        
        if (!useCon) this.mouseMove();
        if(hasGP) {
            this.conMove();
        }
    }

    weasel.mouseMove = function() {
        this.accel = 1.25;
        diffX = mousePos.x - this.x;
        diffY = mousePos.y - this.y;

        //Set Max Speed
        if (this.speed>10) this.speed = 10;

        //Set Min Speed
        if (this.speed < 2) this.speed = 2;

        this.center();
        if (checkBounds(this, mousePos.x, mousePos.y)) {
            //console.log("stopping");
            this.stopped = true;
            this.speed = 0;
        }
        this.uncenter();
        this.angle = Math.atan2(diffY, diffX)*180 / Math.PI;

        this.speed = this.speed * this.accel;

        this.x += Math.cos(this.angle * Math.PI/180) * this.speed;
        this.y += Math.sin(this.angle * Math.PI/180) * this.speed;
    }

    weasel.conMove = function() {
        var gp = navigator.getGamepads()[0];
        var axeLF = gp.axes[0];
        var axeRF = gp.axes[1];
        var q1 = axeLF > 0 && axeRF > 0;
        var q2 = axeLF < 0 && axeRF > 0;
        var q3 = axeLF < 0 && axeRF < 0;
        var q4 = axeLF > 0 && axeRF < 0;

        if (Math.abs(axeLF) > .5 || Math.abs(axeRF) > .5) useCon = true;

        if (useCon) {
            if (Math.abs(axeLF) > .5 || Math.abs(axeRF) > .5) {
                useCon = true;
                this.angle = Math.atan2(axeRF,axeLF);
                console.log(weasel.angle*180/Math.PI);
                this.speed = 10 + Math.abs(axeLF*10);
            } else {
                this.speed = 0;
            }
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        }
    }

    weasel.draw = function() {
        if(!useCon) this.angle = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.translate(-this.x, -this.y);
        this.center();
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.setTransform(1,0,0,1,0,0);
        this.uncenter();
        this.drawChildren();

    }

    function setFollowFalse(){
        console.log("Setting False");
        weasel.eaten.length = 0;
        weasel.followPower = false;
        clearTimeout(followPowerTime);
    }

    function setPushFalse() {
        console.log("Setting False");
        weasel.eaten.length = 0;
        weasel.forcePush = false;
        clearTimeout(pushPowerTime);
    }

    function setSpeedFalse() {
        console.log("Setting False");
        weasel.speedPower = false;
        clearTimeout(speedPowerTime);
    }
//----------------------Display for collected particles----------------------
//----------------------------------------------------------------------


//----------------------Different collision checks----------------------
//----------------------------------------------------------------------

    function check_collision(x, y, array)
    {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for(var i in array)
        {
            if(array[i].x == x && array[i].y == y)
             return true;
        }
        return false;
    }

    function checkBounds(box, x, y) {
       if (x > box.x && x < box.x + box.width && y > box.y
               && y < box.y + box.height) {
           return true;
       }
       return false;
    }

    function clicked(box) {
        if(mouseDowned && checkBounds(box,mousePos.x, mousePos.y)) {
            return true;
        }
        return false;
    }

    //Collision using min/max positions
    function overlap(a, b) {
        aMaxX = a.x;
        aMaxY = a.y;
        bMaxX = b.x + b.width;
        bMaxY = b.y + b.height;

        if (aMaxX < b.x-a.width/2 || a.x-(a.width/2) > bMaxX) return false;
        if (aMaxY < b.y-a.height/2 || a.y-(a.height/2) > bMaxY) return false;

        return true;
    }

    function distance(a,b) {
        //console.log("checking distance")
        var d = Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
        //console.log("Distance: " + d);
        return d;
    }
//----------------------Main Update/Draw---------------------------------
//-----------------------------------------------------------------------

    function handleInput() {
        if (mouseDowned) {
            mousePos = getMousePos(canvas, event);
        }
        for (var i in keysDowned) {
            key = keysDowned[i];
            if (key == 32) {
                switch(pauseMusic) {
                    case false:
                        aud.play();
                        break;
                    case true:
                        aud.pause();
                        break;
                }
            }
            if (key == 27) screenMan.push(pauseScreen);
        }
        if(hasGP) {
            if(gp.buttons[3].pressed){
                useCon = true;
                screenMan.push(pauseScreen);
            }
        }
    }

    function draw() {
        //Draw Background
        canvas.width = canvas.width;

        screenMan.draw();
        ctx.fillStyle = "blue";
        //ctx.fillText("aMaxX: " + aMaxX, 5, 10);
        //ctx.fillText("aMaxY: " + aMaxY, 5, 20);
        //ctx.fillText("bMaxX: " + bMaxX, 5, 30);
        //ctx.fillText("bMaxY: " + bMaxY, 5, 40);
        //ctx.fillText("pauseMusic " + pauseMusic, 5, 50);
        ctx.fillText("Speed Power:" + weasel.speedPower, 5, 10);
        //ctx.fillText("Push Power:" + weasel.forcePush, 5, 20);
        //ctx.fillText("Proton speed:" + protonArray[0].speed + " " + protonArray[1].speed, 5, 30);
    }

    //Update function
    function update() {
      if(state.onGoing){
        handleInput();
        screenMan.update();
      }
    }

    function loadContent() {
        aud.loop = true;
        aud.play();
    }

    function gameLoop() {
        update();
        draw();
    }

    loadContent();

    //if(typeof gameLoop != "undefined") clearInterval(gameLoop);
    setInterval(gameLoop,60);



})
