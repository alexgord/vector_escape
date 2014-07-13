(function(){
    var lifePowerupImage = new Image();
    var healthPowerupImage = new Image();
    var pointPowerupImage = new Image();
    window.HandleCanvasClick = HandleCanvasClick;

    //window.addEventListener('load', POP.init, false);
    window.addEventListener('resize', resize, false);
	
    var starting = true;
    var ended = false;
    var highscore = 0;
    var newRecord = false;
    
    var ua = navigator.userAgent.toLowerCase();
    var android = ua.indexOf('android') > -1 ? true : false;
    var ios = ( ua.indexOf('iphone') > -1 ||
		    ua.indexOf('ipad') > -1  ) ? true : false;

    var currentWidth = 320;
    var currentHeight = 480;
    var canvas = document.getElementById('game');
    var ratio = canvas.width / canvas.height;
    var context = canvas.getContext('2d');
    var base = 10;
    var pLine = "green";
    var pFill = "yellow";
    var pLWidth = 2;
    var velocity = 5;
    var x = canvas.width / 2;
    var y = canvas.height - pLWidth;// - base;//canvas.height / 2;
    canvas.width = currentWidth;
    canvas.height = currentHeight;

    var touching = false;
    var damage = 2;

    var keys = [false, false];
    canvas.setAttribute("style","background-color: #000000;");

    var bars = [];
    var max_bars = 20;
    var barColors = ["red", "blue", "orange", "yellow", "green"];
    var barWidth = 5;
    var barLength = 50;
    var barVelocity = 5;

    var points = [];
    var max_points = 4;
    //var touchingp = false;
    var lifePowerup = [];
    var max_lifePowerups = 2;
    var healthPowerup = [];
    var max_healthPowerups = 2;
    var powerupVelocity = 5;
    
    var score = 0;
    var health = 100;
    var lives = 3;

    console.log("Hello world!!!!");
    
    lifePowerupImage.onload = function() {
	healthPowerupImage.onload = function() {
	    pointPowerupImage.onload = function() {
		startGame();
	    }
	    pointPowerupImage.src = "point.svg";
	}
	healthPowerupImage.src = "healthpowerup.svg";
    }
    lifePowerupImage.src = "lifepowerup.svg";
    
    function startGame()
    {
	console.log("Game started!");
	document.onkeydown = function() {
	    switch (window.event.keyCode) {
            case 37:
		keys[0] = true;
		keys[1] = false;
		break;
            case 38:
		break;
            case 39:
		keys[1] = true;
		keys[0] = false;
		break;
            case 40:
		break;
	    }
	};

	document.onkeyup = function()
	{
	    switch (window.event.keyCode)
	    {
		case 37:
		keys[0] = false;
		break;
		case 38:
		break;
		case 39:
		keys[1] = false;
		break;
		case 40:
		break;
	    }
	};
	console.log("I seem to be working!");
	window.requestAnimFrame = (
	function(callback)
	{
	    return (window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback)
	        {
		    window.setTimeout(callback, 1000 / 60);
		});
	})();
	resize();
	animate();
    }

    function animate()
    {
        //var canvas = document.getElementById('game');
        //var context = canvas.getContext('2d');

        // update
	updateGame();
        // clear
        context.clearRect(0, 0, canvas.width, canvas.height);

        // draw stuff
	drawGame();
        // request new frame
        requestAnimFrame(function() {
          animate();
        });
    }

    function updateGame()
    {
	//console.log("Updating!");
	if(starting || ended)
	{
	    return;
	}
	
	if(lives < 1)
	{
	    highscore = (highscore < score)?score:highscore;
	    newRecord = true;
	    ended = true;
	    return;
	}

	//Generate new bars
	if(bars.length !== max_bars &&
	   Math.floor((Math.random() * 100) + 1) < 25)
	{
	   var tx = Math.floor(
		(Math.random() * canvas.width) + 1) - 1;
	    for(var i = 0; i < bars.length; ++i)
	    {
		if( tx + Math.ceil(barWidth/2) >
		    bars[i].x - Math.ceil(barWidth/2) &&
		    tx - Math.ceil(barWidth/2) <
		    bars[i].x + Math.ceil(barWidth/2))
		{
		    tx = Math.floor(
			(Math.random() * canvas.width) + 1) - 1;
		    i=0;
		}
	    }
	    bars.push({"x": tx,
		       "y":-barLength,
		       "color": barColors[Math.floor(
			   (Math.random() * barColors.length)
			       + 1) - 1]});
	}

	//Move bars
	for(var i = 0; i < bars.length; ++i)
	{
	    bars[i].y += barVelocity;
	    if(bars[i].y > canvas.height)//Remove bars that have left the screen
	    {
		bars.splice(i, 1);
		--i;
	    }
	}

	touching = false;

	//Check if any bars are touching our triangle
	for(var i = 0; i < bars.length; ++i)
	{
	    //Bottom line of bar
	    var b1 = {"p1":
		      {"x" : bars[i].x - Math.ceil(barWidth/2),
		       "y": bars[i].y + barLength},
		      "p2":
		      {"x" : bars[i].x + Math.ceil(barWidth/2),
		       "y": bars[i].y + barLength}};

	    //Top line of bar
	    var b2 = {"p1":
		      {"x" : bars[i].x - Math.ceil(barWidth/2),
			  "y": bars[i].y},
		      "p2":
		      {"x" : bars[i].x + Math.ceil(barWidth/2),
		      "y": bars[i].y}};
	    //left line of bar
	    var b3 = {"p1":
		      {"x" : bars[i].x - Math.ceil(barWidth/2),
			  "y": bars[i].y},
		      "p2":
		      {"x" : bars[i].x - Math.ceil(barWidth/2),
		      "y": bars[i].y + barLength}};
	    //right line of bar
	    var b4 = {"p1":
		      {"x" : bars[i].x + Math.ceil(barWidth/2),
			  "y": bars[i].y},
		      "p2":
		      {"x" : bars[i].x + Math.ceil(barWidth/2),
		      "y": bars[i].y + barLength}};
	    //Left line of triangle
	    var t1 = {"p1":
		      {"x" :  x - Math.ceil(base/2),
			  "y": canvas.height},
		      "p2":
		      {"x" :  x,
		      "y": canvas.height + base}};

	    //Right line of triangle
	    var t2 = {"p1":
		      {"x" :  x + Math.ceil(base/2),
			  "y": canvas.height},
		      "p2":
		      {"x" :  x,
		       "y": canvas.height + base}};

	    var bl = [b1, b2, b3, b4];
	    var tl = [t1, t2];

	    for(var m = 0; m < tl.length; ++m)
	    {
		for(var k = 0; k < bl.length; ++k)
		{
		    if(doIntersect(bl[k].p1, bl[k].p2,
				   tl[m].p1, tl[m].p2))
		    {
			touching  = true;
			health -= damage;
			if(health <= 0)
			{
			    lives--;
			    if(lives >= 1)
			    {
				health = 100;//Reset the health
			    }
			}
			break;
		    }
		}
		if(touching)
		{
		    break;
		}
	    }
	}
	//Generate new point powerups
	if(handlePowerup(points, pointPowerupImage, 5, max_points))
	{
	    ++score;
	}
	if(handlePowerup(lifePowerup, lifePowerupImage, 5, max_lifePowerups))
	{
	    ++lives;
	}

	if(handlePowerup(healthPowerup, healthPowerupImage, 5, max_healthPowerups))
	{
	    health = 100;
	}
	
	/*
	  var points = [];
    var max_points = 4;
    var lifePowerup = [];
    var max_lifePowerups = 4;
    var healthPowerup = [];
    var max_healthPowerup = [];
    var powerupVelociy = 5;
	*/
	
	if(keys[0])
	{
	    x-=velocity;
	}
	else
	{
	    if(keys[1])
	    {
		x+=velocity;
	    }
	}

	x=lock(x,Math.ceil(base/2),canvas.width - Math.ceil(base/2));
    }

    function orientation(pp, pq, pr)
    {
	var val = (pq.y - pp.y) * (pr.x - pq.x) -
              (pq.x - pp.x) * (pr.y - pq.y);
 
	return (val > 0)? 1: 2; // clock or counterclock wise
    }

    function doIntersect(p1, q1, p2, q2)
    {
	// Find the four orientations needed for general and
	// special cases
	var o1 = orientation(p1, q1, p2);
	var o2 = orientation(p1, q1, q2);
	var o3 = orientation(p2, q2, p1);
	var o4 = orientation(p2, q2, q1);
 
	// General case
	if (o1 != o2 && o3 != o4)
            return true;
 
	return false; // Doesn't fall in any of the above cases
    }
    
    function drawGame()
    {
	if(starting)
	{
	    context.fillStyle = "green";
	    context.font = "30px Arial";
	    context.fillText("Vector escape",
			     0,
			     Math.ceil(canvas.height/2));
	    context.fillStyle = "white";
	    context.font = "10px Arial";
	    context.fillText("Instructions:",
			     0,
			     Math.ceil(canvas.height/2) + 30);
	    //Draw the instructions
	    context.font = "10px Arial";
	    context.fillText("Use the arrow keys to move the triangle left and right",
			     0,
			     Math.ceil(canvas.height/2) + 45);
	    //Draw the triangle for the players
	    drawTriangleAt(300, Math.ceil(canvas.height/2) + 45);

	    //Tell the user to avoid all the colored lines
	    context.fillStyle = "white";
	    context.font = "10px Arial";
	    context.fillText("Avoid the colored lines",
			     0,
			     Math.ceil(canvas.height/2) + 65);
	    for(var i = 0; i < barColors.length; ++i)
	    {
		var tbar = {"x": 140 + i * barWidth * 2, "y": Math.ceil(canvas.height/2) + 55, "color": barColors[i]};
		drawLine(tbar);
	    }

	    //Tell the user about the powerups
	    //Points
	    context.drawImage(pointPowerupImage, 0,
			      Math.ceil(canvas.height/2) + 105);
	    context.fillStyle = "white";
	    context.fillText("These give you points",
			     10,
			     Math.ceil(canvas.height/2) + 115);
	    //Lives
	    context.drawImage(lifePowerupImage, 0,
			      Math.ceil(canvas.height/2) + 125);
	    context.fillStyle = "white";
	    context.fillText("These gives you a life",
			     10,
			     Math.ceil(canvas.height/2) + 135);
	    //Health
	    context.drawImage(healthPowerupImage, 0,
			      Math.ceil(canvas.height/2) + 145);
	    context.fillStyle = "white";
	    context.fillText("These replenish your health",
			     10,
			     Math.ceil(canvas.height/2) + 155);

	    context.fillStyle = "green";
	    context.font = "30px Arial";
	    context.fillText("Click to play!",
			     0,
			     Math.ceil(canvas.height/2) + 200);
	    return;
	}
	if(ended)
	{
	    context.fillStyle = "white";
	    context.font = "30px Arial";
	    context.fillText("Your score was:",
			     0,
			     Math.ceil(canvas.height/2));

	    context.fillText(score,
			     0,
			     Math.ceil(canvas.height/2) + 35);

	    context.fillText("Your highest score was:",
			     0,
			     Math.ceil(canvas.height/2) + 70);

	    context.fillText(highscore,
			     0,
			     Math.ceil(canvas.height/2) + 105);

	    if(newRecord)
	    {
		context.fillText("That's a new record!",
			     0,
			     Math.ceil(canvas.height/2) + 140);
	    }

	    context.font = "10px Arial";
	    context.fillText("Click to play again",
			     0,
			     canvas.height - 40);
	    return;
	}

	for(var i = 0; i < bars.length; ++i)
	{
	    drawLine(bars[i]);
	}
	
	drawTriangle();

	/*if(touching)
	{
	    context.fillStyle = "white";
	    context.font = "30px Arial";
	    context.fillText("Touching!",10,50);
	}*/

	/*var img = new Image();
	img.onload = function() {
	    context.drawImage(img, 0, 0);
	}
	img.src = "point.svg";*/

	//Display points powerups
	drawPowerups(points, pointPowerupImage);

	//Display health powerups
	drawPowerups(healthPowerup, healthPowerupImage);

	//Display life powerups
	drawPowerups(lifePowerup, lifePowerupImage);
	
	
	//Display the health
	context.fillStyle = "white";
	context.font = "12px Arial";
	context.fillText("Health: " + health,0,10);
	
	//display healthbar
	//Under
	context.beginPath();
	context.fillStyle = "white";
	context.rect(0, 15, 100, 5);
	context.fill();
	//Over
	context.beginPath();
	context.fillStyle = "green";
	context.rect(0, 15, health, 5);
	context.fill();

	//Display lives
	context.fillStyle = "white";
	context.font = "12px Arial";
	context.fillText("Lives: ",0,35);

	for(var i = 0; i < lives; ++i)
	{
	    context.drawImage(lifePowerupImage,
			      35 + i * lifePowerupImage.naturalWidth, 25);
	}
	
	//Display the score
	context.fillStyle = "white";
	context.font = "12px Arial";
	context.fillText("Score: " + score,0,50);
    }

    function drawTriangle()
    {
	context.beginPath();
	context.moveTo(x - Math.ceil(base/2), y);
	context.lineTo(x + Math.ceil(base/2), y);
	context.lineTo(x, y - Math.ceil(base/2));
	context.lineTo(x - Math.ceil(base/2), y);
	context.lineWidth = pLWidth;
	context.fillStyle = pFill;
	context.strokeStyle = (touching)?"red":pLine;
	context.closePath();
	context.fill();
	
	context.stroke();
	//
	/*context.beginPath();
	context.arc(x, y, base, 0, 2 * Math.PI, false);
	context.fillStyle = 'green';
      
	context.lineWidth = 1;
	context.strokeStyle = '#003300';
	//context.closePath();
	context.fill();
	context.stroke();*/
    }

    function drawTriangleAt(px,py)
    {
	context.beginPath();
	context.moveTo(px - Math.ceil(base/2), py);
	context.lineTo(px + Math.ceil(base/2), py);
	context.lineTo(px, py - Math.ceil(base/2));
	context.lineTo(px - Math.ceil(base/2), py);
	context.lineWidth = pLWidth;
	context.fillStyle = pFill;
	context.strokeStyle = pLine;
	context.closePath();
	context.fill();
	
	context.stroke();
    }

    function drawPartLine(x1, y1, x2, y2)
    {
	context.beginPath();
	context.moveTo(bar.x, bar.y);
	context.lineTo(bar.x, bar.y + barLength);
	context.lineWidth = barWidth;
	context.fillStyle = bar.color;
	context.strokeStyle = bar.color;
	//context.closePath();
	context.fill();
	//context.stroke();
    }
    
    function drawLine(bar)
    {
	context.beginPath();
	context.moveTo(bar.x, bar.y);
	context.lineTo(bar.x, bar.y + barLength);
	context.lineWidth = barWidth;
	context.fillStyle = bar.color;
	context.strokeStyle = bar.color;
	context.stroke();
	context.closePath();
	
	
    }

    function lock(val, llim, ulim)
    {
	return (val < llim)?llim:(val > ulim)?ulim:val;
    }

    function resize()
    {
	currentHeight = window.innerHeight;
        // resize the width in proportion
        // to the new height
        currentWidth = currentHeight * ratio;

        // this will create some extra space on the
        // page, allowing us to scroll past
        // the address bar, thus hiding it.
        if (android || ios) {
            document.body.style.height =
		(window.innerHeight + 50) + 'px';
        }

        // set the new canvas style width and height
        // note: our canvas is still 320 x 480, but
        // we're essentially scaling it with CSS
        canvas.style.width = currentWidth + 'px';
        canvas.style.height = currentHeight + 'px';

        // we use a timeout here because some mobile
        // browsers don't fire if there is not
        // a short delay
        window.setTimeout(function() {
                window.scrollTo(0,1);
        }, 1);
    }

    function handlePowerup(parr, pimg, pperc, pmax)
    {
	var w = Math.ceil(pimg.naturalWidth);
	if(parr.length !== pmax &&
	   Math.floor((Math.random() * 100) + 1) < pperc)
	{
	    
	    var tx = Math.floor(
		(Math.random() * canvas.width) + 1) - 1;
	    for(var i = 0; i < bars.length; ++i)
	    {
		//TODO: Change this to be line intersection collision thing
		/*if( (tx <//+ Math.ceil(w/2) >
		    bars[i].x + Math.ceil(barWidth/2) &&
		    tx >//- Math.ceil(w/2) <
		     bars[i].x - Math.ceil(barWidth/2)) ||
		    (tx + Math.ceil(w) <//+ Math.ceil(w/2) >
		    bars[i].x + Math.ceil(barWidth/2) &&
		     tx + Math.ceil(w)>//- Math.ceil(w/2) <
		     bars[i].x - Math.ceil(barWidth/2)) ||
		    (tx + Math.ceil(w/2) <//+ Math.ceil(w/2) >
		    bars[i].x + Math.ceil(barWidth/2) &&
		     tx + Math.ceil(w/2) >//- Math.ceil(w/2) <
		    bars[i].x - Math.ceil(barWidth/2)))
		{
		    tx = Math.floor(
			(Math.random() * canvas.width) + 1) - 1;
		    i=0;
		}*/
		console.log("i: " + i);
		//Bottom line of powerup
		var b1 = {"p1":
		      {"x" : tx, //- Math.ceil(barWidth/2),
		       "y": w},
		      "p2":
		      {"x" : tx + w,//Math.ceil(barWidth/2),
		       "y": w}};

		//Top line of powerup
		var b2 = {"p1":
		      {"x" : tx,
			  "y": 0},
		      "p2":
		      {"x" : tx + w,
		      "y": 0}};
		//Left line of bar
		var t1 = {"p1":
			  {"x" : bars[i].x - Math.ceil(barWidth/2),
			  "y": bars[i].y},
		      "p2":
		      {"x" : bars[i].x - Math.ceil(barWidth/2),
		      "y": bars[i].y + barLength}};

		//Right line of bar
		var t2 = {"p1":
			  {"x" : bars[i].x + Math.ceil(barWidth/2),
			  "y": bars[i].y},
		      "p2":
		      {"x" : bars[i].x + Math.ceil(barWidth/2),
		      "y": bars[i].y + barLength}};

		var bl = [b1, b2];
		var tl = [t1, t2];
		var b = false;
		for(var m = 0; m < tl.length; ++m)
		{
		    for(var k = 0; k < bl.length; ++k)
		    {
			if(doIntersect(bl[k].p1, bl[k].p2,
				   tl[m].p1, tl[m].p2))
			{
			    tx = Math.floor(
				(Math.random() * canvas.width) + 1) - 1;
			    i=0;
			    b = true;
			    //touchingp = true;
			    //xs++score;
			    //alert("Touching!");
			    break;
			}
		    }
		    if(b)
		    {
			break;
		    }
		}
	    }
	    parr.push({"x": tx,
			 "y":0});
	}
	for(var i = 0; i < parr.length; ++i)
	{
	    parr[i].y += powerupVelocity;
	    if(parr[i].y > canvas.height)//Remove points that have left the screen
	    {
		parr.splice(i, 1);
		--i;
	    }
	}
	touchingp = false;
	//Check if any point powerups are touching our triangle
	for(var i = 0; i < parr.length; ++i)
	{
	    //Bottom line of powerup
	    var b1 = {"p1":
		      {"x" : parr[i].x, //- Math.ceil(barWidth/2),
		       "y": parr[i].y + w},
		      "p2":
		      {"x" : parr[i].x + w,//Math.ceil(barWidth/2),
		       "y": parr[i].y + w}};

	    //Top line of powerup
	    var b2 = {"p1":
		      {"x" : parr[i].x,
			  "y": parr[i].y},
		      "p2":
		      {"x" : parr[i].x + w,
		      "y": parr[i].y}};
	    //left line of powerup
	    var b3 = {"p1":
		      {"x" : parr[i].x,
			  "y": parr[i].y},
		      "p2":
		      {"x" : parr[i].x,
		      "y": parr[i].y + w}};
	    //right line of powerup
	    var b4 = {"p1":
		      {"x" : parr[i].x + w,
			  "y": parr[i].y},
		      "p2":
		      {"x" : parr[i].x + w,
		      "y": parr[i].y + w}};
	    //Left line of triangle
	    var t1 = {"p1":
		      {"x" :  x - Math.ceil(base/2),
			  "y": canvas.height},
		      "p2":
		      {"x" :  x,
		      "y": canvas.height + base}};

	    //Right line of triangle
	    var t2 = {"p1":
		      {"x" :  x + Math.ceil(base/2),
			  "y": canvas.height},
		      "p2":
		      {"x" :  x,
		       "y": canvas.height + base}};

	    var bl = [b1, b2, b3, b4];
	    var tl = [t1, t2];

	    for(var m = 0; m < tl.length; ++m)
	    {
		for(var k = 0; k < bl.length; ++k)
		{
		    if(doIntersect(bl[k].p1, bl[k].p2,
				   tl[m].p1, tl[m].p2))
		    {
			touchingp = true;
			//xs++score;
			//alert("Touching!");
			break;
		    }
		}
		if(touchingp)
		{
		    //points.splice(i, 1);
		    break;
		}
	    }
	    if(touchingp)
	    {
		parr.splice(i, 1);
		break;
	    }
	}

	return touchingp;
    }

    function drawPowerups(parr, pimg)
    {
	for(var i = 0; i < parr.length; ++i)
	{
	    context.drawImage(pimg, parr[i].x, parr[i].y);
	}
    }

    function HandleCanvasClick()
    {
	console.log("Hello click click!");
	if(starting)
	{
	    starting = false;
	}
	if(ended)
	{
	    starting = true;
	    ended = false;
	    ReInitGame();
	}
	return false;
    }

    function ReInitGame()
    {
	score = 0;
	lives = 3;
	health = 100;
	bars = [];
	points = [];
	lifePowerup = [];
	healthPowerups = [];
    }
}());
