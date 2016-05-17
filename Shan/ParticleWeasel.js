/**
 * Created by Andy on 5/8/2016.
 */
$(document).ready(function () {


        var aMaxX = 9;
        var aMaxY = 0 ;
        var bMaxX = 0;
        var bMaxY = 0;


    //Canvas
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

     //Audio variables
    var aud = new Audio("theme.mp3");
    var pauseMusic = false;
    var highscore = 0;

//----------------------Images----------------------------------
//-----------------------------------------------------------------------
    //Source image array
    //@todo: add obstacle and proton images
    var sources = [];
    sources.push("./images/NewGame.png");
    sources.push("./images/MainMenu.png");
    sources.push("./images/ResumeGame.png");
    sources.push("./images/Seal.png");
    sources.push("./images/Particle6.png");
    sources.push("./images/Particle1.png");
    sources.push("./images/Particle2.png");
    sources.push("./images/Particle3.png");
    sources.push("./images/Particle4.png");

    sources.push("./images/Particle7.png");
    sources.push("./images/Particle8.png");
    sources.push("./images/Particle9.png");
    sources.push("./images/Particle10.png");
    sources.push("./images/Particle12.png");
    sources.push("./images/Particle13.png");
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
    
    //If you override, keep this.drawChildren();
    Sprite.prototype.draw = function() {
        //console.log("drawing"+this.image.src);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.drawChildren();
    };

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
        //console.log("initializing");
        var newGame = new Sprite();
        newGame.name = "New Game"
        newGame.image = new Image();
        newGame.image.src = sources[0];
        newGame.width = 224;
        newGame.height = 34;
        newGame.x = canvas.width/2;
        newGame.y = canvas.height/2 - 54;
        newGame.center();
        this.addChild(newGame);
    }
    menu.update = function() {
        if(clicked(this.children[0])) {
            screenMan.push(gameScreen);
        }
    }
    menu.draw = function() {
        ctx.fillText("Highscore: "+highscore, canvas.width/2,10);
        this.drawChildren();
    }


    //----Game Screen-----------------\\
    var gameScreen = new Screen(true, true);
    gameScreen.obstacles = new Array();

    gameScreen.init = function() {
        this.addChild(weasel);
        createObstacles(30);
        createProtons("left");
        createProtons("right");
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
        this.updateChildren();
    }
    gameScreen.draw = function() {
      for(i in partObstacles){
        partObstacles[i].draw();
      }
      for(i in protonArray){
        protonArray[i].draw();
      }
        for(i in explosion){
        explosion[i].draw();
      }
      this.drawChildren();
    }

    //----Pause Menu-----------------\\
    var pauseScreen = new Screen(false, false);
    pauseScreen.init = function() {
        var main = new Sprite();
	    main.image = new Image();        
	    main.image.src = sources[1];
        main.width = 230;
        main.height = 34;
        main.x = canvas.width/2;
        main.y = canvas.height/2 + 54;
        main.center();
        this.addChild(main);

        var resume = new Sprite();
	    resume.image = new Image();
        resume.image.src = sources[2];
        resume.width = 296;
        resume.height = 34;
        resume.x = canvas.width/2;
        resume.y = canvas.height/2;
        resume.center();
        this.addChild(resume);
    }

    pauseScreen.update = function() {
        if(clicked(this.children[0])) {
            screenMan.remove(gameScreen);
            screenMan.push(menu);
        }
        if (clicked(this.children[1])) {
            screenMan.pop(this);
        }

    }
    

    //-------Post-Explosion screen-------\\

    var scoreScreen = new Screen(false, false);
    scoreScreen.init = function() {
        var nextLevel = new Sprite();
        nextLevel.setSrc(sources[0]);
        nextLevel.width = 224;
        nextLevel.height = 34;
        nextLevel.x = canvas.width/2;
        nextLevel.y = canvas.height/2;
        nextLevel.center();
        this.addChild(nextLevel);
    }

    scoreScreen.update = function() {
        if(clicked(this.children[0])) {
            screenMan.push(gameScreen);
        }
    }
    
    
//----------------------Obstacle particle system-------------------------
//-----------------------------------------------------------------------
    var partObstacles = new Array();
    function Particle(lifeTime, speed, x, y, period, color, radius) {
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
        this.image.src = sources[Math.floor(Math.random()  * (14-5) + 5)];

        this.float = function() {
            if (this.y > 0 && this.period >= 0) {
                this.y -= this.speed;
                this.x += this.speed * .3;
                this.period--;
                if (this.period == 0) {
                    this.period = -10;
                }
            } else if (this.y > 0 && this.period < 0) {
                this.y -= this.speed;
                this.x -= this.speed * .3;
                this.period++;
                if (this.period == 0) {
                    this,period = 10;
                }
            } else {
                this.y = h;
                this.x = Math.random() * w;
                this.period = 10;
            }
        }
		
		this.drift = function() {
			
		}
    }

    Particle.prototype = new Sprite();

    Particle.prototype.update = function() {
        //console.log(this.running);
        if(this.running) {
            this.moveAway(weasel);
        } else this.float();

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
            angle = Math.atan2(diffY, diffX)*180 / Math.PI;
            this.x += Math.cos(angle * Math.PI/180) * this.speed;
            this.y += Math.sin(angle * Math.PI/180) * this.speed;
        }

    Particle.prototype.moveAway = function (Coord){
            diffX = Coord.x - this.x;
            diffY = Coord.y - this.y;
            //console.log("x = " + Coord.x);
            //console.log("y = " + Coord.y);
            angle = Math.atan2(diffY, diffX)*180 / Math.PI;
            this.x += Math.cos(angle * Math.PI/180) * -this.speed;
            this.y += Math.sin(angle * Math.PI/180) * -this.speed;
        }


    //Called in game screen init.
    function createObstacles(numObstacles) {
        partObstacles = [];
        for(var i = 0; i < numObstacles; i++){
            partObstacles.push(new Particle(Math.random()*10, 5 - Math.random()*4,
                Math.random()*w, canvas.height, 10, "red",10 ))
        }
    }
    

//----------------------Proton "System"---------------------------------
//----------------------------------------------------------------------

    //Could not figure out a way to make them moves towards eacht

    var protonArray = [];
    protonCount = 1;
    function Proton(x, y, speed, side, radius, target){
        Sprite.call(this);
        this.x = x;
        this.y = y;
        this.width = radius*2;
        this.height = radius*2;
        this.speed = 5;
        this.side = side;
        this.radius = radius;
        this.target = target
        this.image.src=sources[4];
        this.array = [];

    }

    Proton.prototype = new Particle();

    Proton.prototype.init = function() {
        if (this.side == "left") {
            this.x = -5;
            this.y = h/4;
        } else {
            this.x = w+5;
            this.y = 3*(h/4);
        }
    }

    Proton.prototype.update = function () {
        if(weasel.followPower == true){
          console.log(distance(this,weasel));
          console.log(distance(partObstacles[this.target], weasel));
          if(distance(this, weasel) < distance(protonArray[this.target], weasel)){
            protonArray[this.target].moveTowards(this);
            this.moveTowards(weasel);
          }else if(distance(this, weasel) > distance(protonArray[this.target], weasel)){
            this.moveTowards(protonArray[this.target]);
            partObstacles[this.target].moveTowards(weasel);
          }
        }
        if(protonArray.length == 2 && !weasel.followPower){
            this.moveTowards(protonArray[this.target]);
        }
        if(weasel.forcePush) {
          for(i in partObstacles){
              if(distance(weasel, partObstacles[i]) < 200) {
                  partObstacles[i].running = true;
              }
            }
          }
        if(this.overlap(this, protonArray[this.target])){
            makeExplosion(40);
            protonArray.pop();
            protonArray.pop();
            protonCount = 1;
            gameScreen.children.pop();
            screenMan.push(scoreScreen);
        }
        for(i in partObstacles){
  				if(this.overlap(this, partObstacles[i])){
  					protonArray.pop();
            protonArray.pop();
            protonCount += 2;
            createProtons("left");

            createProtons("right");
  				}
        }
        if(this.x < -50 || this.x > w+50) {
            this.init();
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
                protonArray.push(new Proton(-30, h/2 ,2, "left", 15, protonCount));
            }
            if(side == "right"){
                protonArray.push(new Proton(w+5, (h/2) ,2, "right", 15, protonCount));
            }
            protonCount--;
        }

//----------------------Particle System for Win Condition--------------
//--------------------------------------------------------------------------
    var explosion = [];
    function explosionParticle(x, y, radius, vSpeed, hSpeed){
        Sprite.call(this);
        this.x = x;
        this.y = y;
        this.width = radius*2;
        this.height = radius*2;
        this.radius = radius;
        this.vSpeed = vSpeed;
        this.hSpeed = hSpeed;
        this.image.src = sources[Math.floor(Math.random()  * (14-5) + 5)];
    }

    explosionParticle.prototype = new Particle();

    explosionParticle.prototype.update = function(){
      this.x += this.hSpeed;
      this.y += this.vSpeed;
    }

    function makeExplosion(numParticles){
        explosion = [];
        for (var i = 0; i < numParticles; i++) {

        explosion.push(new explosionParticle(protonArray[1].x, protonArray[1].y, 15, Math.sin(i), Math.cos(i)));
        }
    }



//----------------------Weasel Implementation---------------------------------
//----------------------------------------------------------------------
    var weasel = new Sprite();
    weasel.image = new Image();
    weasel.setSrc(sources[3]);
    weasel.x = canvas.width/2;
    weasel.y = canvas.height/2;
    weasel.center();
    weasel.speed = .1;
    weasel.accel = 1.25;
    weasel.stopped = true;
    weasel.numEaten = 0;
    weasel.followPower = false;
    weasel.forcePush = false;

    weasel.update = function() {
        if(this.numEaten > 2 && this.numEaten < 5){
          this.followPower = true;
		  setTimeOut(setFollowFalse,10000); //10sec
        }else{
          this.followPower = false;
        }
        if(this.numEaten > 7 && this.numEaten < 30){
          this.forcePush = true;
		  setTimeOut(setPushFalse,10000);
        }else{
          this.forcePush = false;
        }
        for(i in partObstacles){
            if(overlap(this, partObstacles[i])){
                partObstacles.splice(i,1);
                this.numEaten++;
            }
        }

        if (mouseDowned && this.stopped == true) {
            this.stopped = false;
            this.speed = .5;

        }

        if(this.numEaten > 2){
            this.followPower = true;
        }

        this.accel = 1.25;

        diffX = mousePos.x - this.x;
        diffY = mousePos.y - this.y;


        //Set Max Speed
        if (this.speed > 10) this.speed = 10;

        //Set Min Speed
        if (this.speed < 2) this.speed = 2;

        this.center();
        if (checkBounds(this, mousePos.x, mousePos.y)) {
            //console.log("stopping");
            this.stopped = true;
            this.speed = 0;
        }
        this.uncenter();
        angle = Math.atan2(diffY, diffX)*180 / Math.PI

        this.speed = this.speed * this.accel;

        this.x += Math.cos(angle * Math.PI/180) * this.speed;
        this.y += Math.sin(angle * Math.PI/180) * this.speed;
    }

    weasel.draw = function() {
        this.center();
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.uncenter();
        this.drawChildren();
		ctx.fillText("Follow: " + this.followPower, 0, canvas.height/2);
		ctx.fillText("Push: " + this.forcePush, 0, canvas.height/2 + 20);
    }
	
	weasel.setFollowFalse = function(){
	    this.followPower = false;
	}
	
	weasel.setPushFalse = function(){
		this.forcePush = false;
	}


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
    }

    function draw() {
        //Draw Background
        canvas.width = canvas.width;

        screenMan.draw();
        ctx.fillStyle = "blue";
        ctx.fillText("aMaxX: " + aMaxX, 5, 10);
        ctx.fillText("aMaxY: " + aMaxY, 5, 20);
        ctx.fillText("bMaxX: " + bMaxX, 5, 30);
        ctx.fillText("bMaxY: " + bMaxY, 5, 40);
        ctx.fillText("pauseMusic " + pauseMusic, 5, 50);
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
