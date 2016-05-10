/**
 * Created by Andy on 5/8/2016.
 */
$(document).ready(function () {
    //Canvas
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();


//----------------------Obstacle particle system-------------------------
//-----------------------------------------------------------------------
    var partObstacles = new Array();
    function Particles(lifeTime, speed, x, y, period, color, radius) {
        this.lifeTime = lifeTime;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.period = period;
        this.color = color;
        this.radius = radius;

        this.draw = function() {
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.stroke();

        }

        this.update = function() {
            if (y > 0 && period >= 0) {
                y -= speed;
                x += speed * .3;
                period--;
                if (period == 0) {
                    period = -10;
                }
            } else if (y > 0 && period < 0) {
                y -= speed;
                x -= speed * .3;
                period++;
                if (period == 0) {
                    period = 10;
                }
            } else {
                y = h;
                x = Math.random() * w;
                period = 10;
            }
        }
    }

    function createObstacles(numObstacles) {
        for(var i = 0; i < numObstacles; i++){
            partObstacles.push(new Particles(Math.random()*10, 15 - Math.random()*10,
                Math.random()*w, canvas.height, 10, "red",10 ))
        }
    }

//----------------------Proton "System"---------------------------------
//-----------------------------------------------------------------------

    function Proton(x,y, speed, color, radius){
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

//----------------------Main Update/Draw---------------------------------
//-----------------------------------------------------------------------

    createObstacles(100);

    function update() {
        for(var i = 0; i < partObstacles.length; i++){
            partObstacles[i].update();
        }
    }

    function draw() {
        ctx.fillStyle = "green";
        ctx.fillRect(0,0,w,h);

        for(var i = 0; i < partObstacles.length; i++){
            partObstacles[i].draw();
        }
    }

    function game_loop() {
        update();
        draw();

    }

    setInterval(game_loop, 60);






})