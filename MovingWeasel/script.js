/* 
 * John Cochran, jdcochra
 * 
 */

$(document).ready(function(){

//Setup Canvas
var canvas = $("#snake")[0];
var ctx = canvas.getContext('2d');

//Input variables
var event;
var mousePos;
var mouseDowned = false;
keysDowned = [];

//Audio variables
var aud = new Audio();
var pauseMusic = false;

var highscore = 0;




//Collision variables
var aMaxX, aMaxY, bMaxY, bMaxX = 0;

//Remove cursor
//canvas.style.cursor = "none";

$(document).mousedown(function(e) {
    mouseDowned = true;
})

$(document).mouseup(function(e) {
    mouseDowned = false;
})

$(document).mousemove(function(e) {
    event = e;
})
//Correct mouse position in canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Fuck trying to use multiple js files.

/*
 * Sprites
 *
 */

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

/*
 * Screens
 *
 */
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


//Source image array
var sources = [];
sources.push("NewGame.png");
sources.push("MainMenu.png");
sources.push("ResumeGame.png");

var screenMan = new ScreenManager();

var menu = new Screen(false,false);
screenMan.push(menu);
menu.init = function() {
    console.log("initializing");
    var newGame = new Sprite();
    newGame.name = "New Game"
    newGame.image = new Image();
    newGame.image.src = "NewGame.png";
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





var weasel = new Sprite();
weasel.image = new Image();
weasel.setSrc("Seal.png");
weasel.x = canvas.width/2;
weasel.y = canvas.height/2;
weasel.center();
weasel.speed = .1;
weasel.accel = 1.25;
this.stopped = true;

weasel.update = function() {
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





var gameScreen = new Screen(false, true);
gameScreen.init = function() {
    this.addChild(weasel);
}
gameScreen.update = function() {
    this.updateChildren();
}
gameScreen.draw = function() {
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
    
    ctx.fillStyle ='red';
    ctx.fillRect(b.x,b.y,bMaxX,bMaxY);

    if (aMaxX < b.x || a.x > bMaxX) return false;
    if (aMaxY < b.y || a.y > bMaxY) return false;

    return true;
}

function handleInput() {
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
        if (key == 27) {
            screenMan.push(pauseScreen);
        }
        if(canMove && key == "37" && dir != "right") dir = "left";
        else if(canMove && key == "38" && dir != "down") dir = "up";
        else if(canMove && key == "39" && dir != "left") dir = "right";
        else if(canMove && key == "40" && dir != "up") dir = "down";
        canMove = false;
    }
}

//Draw function
function draw() {
    //Draw Background
    canvas.width = canvas.width;

    screenMan.draw();
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


});
