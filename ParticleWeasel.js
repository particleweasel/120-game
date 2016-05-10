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
    var aud = new Audio();
    var pauseMusic = false;
    var highscore = 0;
    
//----------------------Images----------------------------------
//-----------------------------------------------------------------------
    //Source image array
    var sources = [];
    sources.push("./images/NewGame.png");
    sources.push("./images/MainMenu.png");
    sources.push("./images/ResumeGame.png");
    sources.push("./images/Seal.png");
    
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

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
//----------------------Sprite Function----------------------------------
//-----------------------------------------------------------------------
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

    Sprite.prototype.center = function() {
        this.x = this.x-this.width/2;
        this.y = this.y-this.height/2;
    }

    Sprite.prototype.uncenter = function() {
        this.x = this.x+this.width/2;
        this.y = this.y+this.height/2;
    }

    Sprite.prototype.draw = function() {
        console.log("drawing"+this.image.src);
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
    
    
    


//----------------------Obstacle particle system-------------------------
//-----------------------------------------------------------------------
    var partObstacles = new Array();
    function Particles(lifeTime, speed, x, y, period, color, radius) {
        this.lifeTime = lifeTime;
        this.speed = speed;
        this.width = radius*2;
        this.height = radius*2;
        this.x = x;
        this.y = y;
        this.period = period;
        this.color = color;
        this.radius = radius;

        this.draw = function() {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            ctx.stroke();

        }

        this.update = function() {
            
            if (this.y > 0 && period >= 0) {
                this.y -= speed;
                this.x += speed * .3;
                period--;
                if (period == 0) {
                    period = -10;
                }
            } else if (this.y > 0 && period < 0) {
                this.y -= speed;
                this.x -= speed * .3;
                period++;
                if (period == 0) {
                    period = 10;
                }
            } else {
                this.y = h;
                this.x = Math.random() * w;
                period = 10;
            }
            
            
        }
    }

    function createObstacles(numObstacles) {
        for(var i = 0; i < numObstacles; i++){
            partObstacles.push(new Particles(Math.random()*10, 5 - Math.random()*4,
                Math.random()*w, canvas.height, 10, "red",10 ))
        }
    }
    createObstacles(30);

//----------------------Proton "System"---------------------------------
//----------------------------------------------------------------------

    
    function Proton(x, y, speed, color, radius){
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.color = color;
        this.radius = radius;

        this.draw = function () {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        this.update = function () {


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
    this.stopped = true;

    weasel.update = function() {
        for(i in partObstacles){
            if(overlap(this, partObstacles[i])){
                partObstacles.splice(i,1);
            }
        }
 
        if (mouseDowned && this.stopped == true) {
            this.stopped = false;
            this.speed = .5;
            
        }
        this.accel = 1.25;

        diffX = mousePos.x - this.x;
        diffY = mousePos.y - this.y;

        distance = Math.sqrt(diffX^2 + diffY^2)
        
        //Set Max Speed
        if (this.speed > 10) this.speed = 10;
        
        //Slow down if getting close, needs image offset
        //if (distance < 10) this.accel = .75;
        
        //Set Min Speed
        if (this.speed < 2) this.speed = 2;

        this.center();
        if (checkBounds(this, mousePos.x, mousePos.y)) {
            console.log("stopping");
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
    }
        
    
   

  




//----------------------Menu System Functions---------------------------
//----------------------------------------------------------------------
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


    

    var screenMan = new ScreenManager();

    var menu = new Screen(false,false);
    screenMan.push(menu);
    menu.init = function() {
        console.log("initializing");
        var newGame = new Sprite();
        newGame.name = "New Game"
        newGame.image = new Image();
        newGame.image.src = sources[1];
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

//----------------------Menu System Implementaton-----------------------
//----------------------------------------------------------------------
    var gameScreen = new Screen(false, true);
    gameScreen.obstacles = new Array();
    
    gameScreen.init = function() {
        this.addChild(weasel);
        
        //this.addChild(partObstacles);
    }
    gameScreen.update = function() {
        for(i in partObstacles){
            partObstacles[i].update();
        }
        this.updateChildren();
    }
    gameScreen.draw = function() {
        for(i in partObstacles){
            partObstacles[i].draw();
        }    
        this.drawChildren();
    }

    var pauseScreen = new Screen(false, false);
    pauseScreen.init = function() {
        var main = new Sprite();
        main.setSrc(sources[1]);
        main.width = 230;
        main.height = 34;
        main.x = canvas.width/2;
        main.y = canvas.height/2 + 54;
        main.center();
        this.addChild(main);

        var resume = new Sprite();
        resume.setSrc(sources[2]);
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
        aMaxX = a.x + a.width;
        aMaxY = a.y + a.height;
        bMaxX = b.x + b.width;
        bMaxY = b.y + b.height;
        
        
                

        if (aMaxX < b.x || a.x > bMaxX) return false;
        if (aMaxY < b.y || a.y > bMaxY) return false;

        return true;
    }
//----------------------Main Update/Draw---------------------------------
//-----------------------------------------------------------------------



    function draw() {
        //Draw Background
        canvas.width = canvas.width;

        screenMan.draw();
        ctx.fillStyle = "blue";
        ctx.fillText("aMaxX: " + aMaxX, 5, 10);
        ctx.fillText("aMaxY: " + aMaxY, 5, 20);
        ctx.fillText("bMaxX: " + bMaxX, 5, 30);
        ctx.fillText("bMaxY: " + bMaxY, 5, 40);
    }

    //Update function
    function update() {
        if (mouseDowned) {
            mousePos = getMousePos(canvas, event);
        }
        screenMan.update();
        
        canMove = true;
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
