// requestAnim shim layer by Paul Irish
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

var div = document.getElementById('div');
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

if (div.requestFullscreen) {
  div.requestFullscreen();
}

var width = 1000;
var height = 680;
var roller = 0;
var ticker = 0;
var mode = 0;

//---------------------- EVENT HANDLERS ------------------------------

function OnResizeCalled() { 
    div.style.width = window.innerWidth + 'px'; 
    div.style.height = window.innerHeight + 'px'
      
    var gameWidth = window.innerWidth; 
    var gameHeight = window.innerHeight; 
    var scaleToFitX = gameWidth / width; 
    var scaleToFitY = gameHeight / height; 
     
    var currentScreenRatio = gameWidth / gameHeight; 
    var optimalRatio = Math.min(scaleToFitX, scaleToFitY); 
     
    if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) { 
        div.style.width = gameWidth + "px"; 
        div.style.height = gameHeight + "px"; 
    } 
    else { 
        div.style.width = width * optimalRatio + "px"; 
        div.style.height = height * optimalRatio + "px"; 
    } 
}
OnResizeCalled();

function keyed(e) {
  e.preventDefault();
  var key = String.fromCharCode(e.keyCode);
  if (mode == 1) {
    if (key == "A" || key == "%") {player.moveLeft()};
    if (key == "D" || key == "'") {player.moveRight()};
    if (key == "S" || key == "(") {player.moveDown()};
    if (key == "W" || key == "&") {player.moveUp()};
  }
}

function moused(e) {
  e.preventDefault();
  if (mode == 0) {
    startGame();
  } else if (mode == 2) {
    cancelAnimationFrame(roller);
    window.location.reload(false); 
  }
}

function touched(e) {
  e.preventDefault();
  var x = e.changedTouches[0].clientX;
  var y = e.changedTouches[0].clientY;
  if (mode == 0) {
    startGame();
  } else if (mode == 1) {
    if (x < 350 && y > 200 && y < 480) {player.moveLeft()};
    if (x > 750 && y > 200 && y < 480) {player.moveRight()};
    if (y > 480 && x > 350 && x < 650) {player.moveDown()};
    if (y < 200 && x > 350 && x < 650) {player.moveUp()};
  } else if (mode == 2) {
    cancelAnimationFrame(roller);
    window.location.reload(false); 
  }
}

//---------------------------------------------------------------------

// ------------------ EVENTS ------------------------------------------

window.addEventListener("resize", OnResizeCalled, false);
window.addEventListener("orientationchange", OnResizeCalled, false);  
document.addEventListener("keydown", keyed, false);
document.addEventListener("click", moused, false);
document.addEventListener("touchstart", touched, false);

//----------------------------------------------------------------------

//------------------------ MENU LOOP -------------------------------

function menu() {
  roller = requestAnimFrame(menu);
  ctx.clearRect(0, 0, width, height);
  ticker++;

//---------------------- Updating Objects ---------------------------

  if (ticker > 80) {
    title.update(mode);
    subtitle.update(mode);
  }

  player.updateMove();
  player.update();


//---------------------- Drawing Objects -----------------------------

  // Draw Background
  ctx.fillStyle = "#ABFF4F";
  ctx.fillRect(0, 0, width, height);

  // Draw Title
  title.draw();

  // Draw subtitle
  subtitle.draw();

  player.draw();

}

//------------------------------------------------------------------

//----------------------- GAME LOOP ------------------------------------

function main() {
  roller = requestAnimFrame(main);   
  ticker++;
  ctx.clearRect(0, 0, width, height);

//------------------------ UPDATE OBJECTS ----------------------------

  // Update Player
  player.update();

  // Update Enemy and Spawn new ones
  Enemy.update();
  if (ticker % Enemy.easiness == 0) {
    Enemy.spawn();
  }

  // Update Star and Spawn new ones
  Star.update();
  if (ticker % (Enemy.easiness) == 0) {
    Star.spawn();
  }

  // Update Explosion 
  Explosion.update();

  if (mode == 2) {gameOverCard.update()};

//----------------------- DRAWING OBJECTS -----------------------------
  
  // Draw Background
  ctx.fillStyle = "#ABFF4F";
  ctx.fillRect(0, 0, width, height);

  Score.draw();

  // Draw Player
  player.draw();
  
  // Draw Enemy
  Enemy.draw();

  // Draw Star
  Star.draw();

  // Draw Explosion
  Explosion.draw();

  if (mode == 2) {gameOverCard.draw()};

}

//----------------------------------------------------------------------

//--------------------- OBJECT CLASSES ---------------------------------

var title = {
  
  x: 200,
  y: -100,
  color: "White",
  velocityEntry: 13,
  velocityExit: 13,

  update: function(myMode) {
    if (myMode == 0) {
      if (this.velocityEntry > -2) {
        this.velocityEntry -= 0.2; 
        this.y += this.velocityEntry;
      }
    } else if (myMode == 1) {
      if (this.velocityExit < -2) {
        this.velocityExit -= 0.2; 
        this.y -= this.velocityExit;
      }
    }
  },

  draw: function() {
    ctx.fillStyle = this.color;
    ctx.font = "150px Arial";
    ctx.fillText("Z U P A", this.x, this.y);
  }

}

var subtitle = {

  x: 290, 
  y: 800,
  color: "White",
  velocityEntry: 13,
  velocityExit: 13,

  update: function(myMode) {
    if (myMode == 0) {
      if (this.velocityEntry > -2) {
        this.velocityEntry -= 0.2; 
        this.y -= this.velocityEntry;
      }
    } else {
      if (this.velocityExit < -2) {
        this.velocityExit -= 0.2; 
        this.y += this.velocityExit;
      }
    }
  },

  draw: function() {
    ctx.fillStyle = this.color;
    ctx.font = "30px Arial";
    ctx.fillText("Click Anywhere To Play", this.x, this.y);
  }

}

var player = {
  
  width: 30,
  height: 30,
  x: 485,
  y: 225,
  velocityX: 0,
  velocityY: 0,
  color: "#F21B3F",
  canKill: false,
  delay: 0,
  touchingWalls: false,

  kill: function() {
    this.color = "rgba(0, 207, 0, 0)";
    if (mode == 1) {lost.play()};
    mode = 2;
  },

  moveUp: function() {
    this.velocityY = -10;
    this.velocityX = 0;
  },

  moveLeft: function() {
    this.velocityX = -10;
    this.velocityY = 0;
  },

  moveRight: function() {
    this.velocityX = 10;
    this.velocityY = 0;
  },

  moveDown: function() {
    this.velocityY = 10;
    this.velocityX = 0;
  },

  update: function() {
    if (this.y < 0) {
      this.velocityY = 0;
      this.y = 0;
      touchingWalls = true;
    } else if (this.y > 650) {
      this.velocityY = 0;
      this.y = 650;
      touchingWalls = true;
    } else if (this.x < 0) {
      this.velocityX = 0;
      this.x = 0;
      touchingWalls = true;
    } else if (this.x > 970) {
      this.velocityX = 0;
      this.x = 970;
      touchingWalls = true;
    } else {
      this.x += this.velocityX;
      this.y += this.velocityY;
    }
  },

  updateMove: function(myMode) {
    if (this.delay == 0 || this.touchingWalls) {
      var direction = Math.floor(Math.random() * 100) + 1;
      if (direction < 25 && this.y > 0) {
        this.velocityX = 0;
        this.velocityY = -10;
      };
      if (direction > 25 && direction < 50 && this.x < 970) {
        this.velocityX = 10;
        this.velocityY = 0;
      };
      if (direction > 50 && direction < 75 && this.y < 650) {
        this.velocityX = 0;
        this.velocityY = 10;
      };
      if (direction > 75 && this.x > 0) {
        this.velocityX = -10;
        this.velocityY = 0;
      };
      this.delay = 15;
    } else {
      this.delay--;
    };
  },

  draw: function() {  
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

}

var Score = {

  x: 485,
  y: 350,
  color: "#06D6A0",
  value: 0,

  draw: function() {
    ctx.fillStyle = this.color;
    ctx.font = "100px Arial";
    ctx.fillText(""+this.value, this.x, this.y);
  }

}

var Enemy = {
  color: "#FF9914",
  posX: [],
  posY: [],
  radii: [],
  easiness: 100,

  spawn: function() {
    this.posX.push(Math.floor(Math.random() * 900) + 1);
    this.posY.push(Math.floor(Math.random() * 600) + 1);
    this.radii.push(0);
  },

  update: function() {
    for (var i in this.posX) {
      // Detect Collision
      var dX = this.posX[i] - (player.x+(player.width/2));
      var dY = this.posY[i] - (player.y+(player.height/2));
      var distance = Math.sqrt((dX*dX) + (dY*dY));
      if (distance <= this.radii[i]) {
        if (player.canKill) {
          Explosion.spawn("linear", this.posX[i], this.posY[i]);
          delete this.posX[i];
          delete this.posY[i];
          player.canKill = false;
          Score.value++;
          killed.play();
        } else {
          player.kill();
        }
      };

      // Update Animation
      if (this.radii[i] < 80) {
        this.radii[i] += 5;
      }
    }
  },

  draw: function() {
    for (var i in this.posX) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.posX[i], this.posY[i], this.radii[i]/2, 0, 2*Math.PI);
      ctx.fill();
    }
  }
}

var Star = {
  posX: [],
  posY: [],
  width: 20,
  height: 20,
  color: "#29BF12",

  spawn: function() {
    var x = Math.floor(Math.random() * 900) + 1;
    var y = Math.floor(Math.random() * 600) + 1;
    this.posX.push(x);
    this.posY.push(y);
    Explosion.spawn("reverse", x+this.width, y+this.height);
  },

  update: function() {
    for (var i in this.posX) {
      var dX = (this.posX[i]+(this.width/2)) - (player.x+(player.width/2));
      var dY = (this.posY[i]+(this.height/2)) - (player.y+(player.height/2));
      var distance = Math.sqrt((dX*dX) + (dY*dY));
      if (distance <= this.width) {
        player.canKill = true;
        berrySpawn.play();
        delete this.posX[i];
        delete this.posY[i];
      };
    }
  },

  draw: function() {
    for (var i in this.posX) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.posX[i], this.posY[i], this.width, this.height);
    }
  }
}

var Explosion = {

  color: "#F21B3F",
  x: [],
  y: [],
  radius: [],
  width: [],
  dirAnimation: [],

  spawn: function(dir, x, y) {
    if (dir == "linear") {
      this.radius.push(0);
      this.width.push(10);
      this.dirAnimation.push("linear");
    } else if (dir == "reverse") {
      this.radius.push(80);
      this.width.push(0);
      this.dirAnimation.push("reverse");      
    }
    this.x.push(x);
    this.y.push(y);
  },

  update: function() {
    for (var i in this.x) {
      if (this.dirAnimation[i] == "linear") {
        if (this.radius[i] < 100) {
          this.radius[i] += 10;
          this.width[i] -= 1;
        } else {
          delete this.radius[i];
          delete this.width[i];
          delete this.x[i];
          delete this.y[i];
          delete this.dirAnimation[i];
        }
      } else if (this.dirAnimation[i] == "reverse") {
        if (this.radius[i] > 0) {
          this.radius[i] -= 10;
          this.width[i] += 1;
        } else {
          delete this.radius[i];
          delete this.width[i];
          delete this.x[i];
          delete this.y[i];
          delete this.dirAnimation[i];
        }
      }
    }
  },

  draw: function() {
    for (var i in this.x) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width[i];
      ctx.beginPath();
      ctx.arc(this.x[i], this.y[i], this.radius[i], 0, 2*Math.PI);
      ctx.stroke();
    }
  }

}

var gameOverCard = {

  x: 250,
  y: 215,
  width: 0,
  height: 250,
  color: "#06D6A0",
  changeFactor: 10,

  update: function() {
    if (this.width < 500) {
      if (this.changeFactor > 1) {this.changeFactor -= 0.1};
      this.width += this.changeFactor;
    }
  },

  draw: function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "70px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Game Over", this.x + 65, this.y + 110);
    var msg = "Your Score is " + Score.value;
    ctx.font = "30px Arial";
    ctx.fillText(msg, this.x + 150, this.y + 170);
  }

}

//----------------------------------------------------------------------

menu(); // KICK START THE MENU LOOP !

function startGame() {
  mode = 1;
  cancelAnimationFrame(roller);
  main();
}