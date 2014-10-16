var BRNSTM = {};

//instance variables
//the objects we care about
var body = document.getElementsByTagName('body')[0];
var target = document.querySelector('#floater');
var paddle = document.querySelector('#paddle');
var message = document.querySelector('#message');
var blocks = document.getElementsByClassName('block');
var ultra = document.querySelector('#ultra');
var one = document.querySelector('#score_one');
var two = document.querySelector('#score_two');
var thr = document.querySelector('#score_thr');

//position of the ball
var target_left = 10;
var target_top = 10;

var right_bound = window.innerWidth - target.offsetWidth - 10; //left is 0..
var bottom_bound = window.innerHeight - target.offsetHeight - 10; //top is 0..

var step = 1;
var speed = 5;
var vert_dir = 1;
var horz_dir = 1;
var paused = false;
var score = 0;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function addBlock() {
    var newBlock = document.createElement('div');
    var x = getRandomInt(10, right_bound - 60);
    var y = getRandomInt(10, bottom_bound - 100);
    newBlock.className = 'block';
    newBlock.id = blocks.length + 1;
    newBlock.style.top = y + 'px';
    newBlock.style.left = x + 'px';
    ultra.appendChild(newBlock);
    blocks = document.getElementsByClassName('block');
}

function removeBlock(block) {
    ultra.removeChild(block);
}

function scorePoint() {
    var pos_dict = {'0': 0, '1': 70, '2': 130, '3': 200, '4': 270, '5': 330, '6': 390, '7': 460, '8': 520, '9': 580};
    if (score == 999) {
      score = 0;
    } else {
      score++;
    }
    var str = score.toString();
    if (score < 10) {
      thr.style.backgroundPosition = '-' + pos_dict[str[0]] + 'px';
    } else if (score < 100) {
      two.style.backgroundPosition = '-' + pos_dict[str[0]] + 'px';
      thr.style.backgroundPosition = '-' + pos_dict[str[1]] + 'px';
    } else if (score < 1000) {
      one.style.backgroundPosition = '-' + pos_dict[str[0]] + 'px';
      two.style.backgroundPosition = '-' + pos_dict[str[1]] + 'px';
      thr.style.backgroundPosition = '-' + pos_dict[str[2]] + 'px';
    }
}

function pause() {
  if (paused) {
    message.style.display = "none";
    animation = setInterval(game_loop, speed);
    body.style.cursor = 'none';
    paused = false;
  } else {
    message.style.display = "inline";
    clearInterval(animation);
    body.style.cursor = 'default';
    paused = true;
  }
}

function collision(el_one, el_two) {
  var one = el_one.getBoundingClientRect();
  var two = el_two.getBoundingClientRect();
  var one_cm = {'x': one.left + (one.right - one.left) / 2,
                'y': one.bottom + (one.top - one.bottom) / 2}
  var two_cm = {'x': two.left + (two.right - two.left) / 2,
                'y': two.bottom + (two.top - two.bottom) / 2}

  var dy = (one_cm.y - two_cm.y);
  var dx = (one_cm.x - two_cm.x);
  var v_collide = false;
  var h_collide = false;
  var theta = 0;

  if (dy === 0 && dx > 0) { //0 degrees
      theta = 0;
  } else if (dy === 0 && dx < 0) { //180 degrees
      theta = Math.PI;
  } else if (dy > 0 && dx === 0) { //90 degrees
      theta = Math.PI / 2;
  } else if (dy < 0 && dx === 0) { //270 degrees
      theta = 3 * Math.PI / 2;
  } else if (dy > 0 && dx > 0) { //quadrant one
      theta = Math.atan(dy / dx);
  } else if (dy > 0 && dx < 0) { //quadrant two
      theta = Math.atan(dy / dx) + Math.PI / 2;
  } else if (dy < 0 && dx < 0) { //quadrant three
      theta = Math.atan(dy / dx) + Math.PI;
  } else if (dy < 0 && dx > 0) { //quadrant four
      theta = Math.atan(dy / dx) + 3 * Math.PI / 2;
  }
  //check for vertical collides
  if (one.bottom > two.top  && one.bottom < two.bottom) {
    v_collide = true;
  } else if (one.top >= two.top && one.top <= two.bottom) {
    v_collide = true;
  }

  //check for horizontal collides
  if (one.right >= two.left && one.right <= two.right) {
    h_collide = true;
  } else if (one.left >= two.left && one.left <= two.right) {
    h_collide = true;
  }

  //response.collide is true if both v_collide and h_collide are true
  if (v_collide && h_collide) {
      return theta;
  } else {
      return false;
  }
}

//resets the game to it's starting state.
function reset() {
  pause();
  score = -1;
  scorePoint();
  target.style.top = '10px';
  target.style.left = '10px';
  one.style.backgroundPosition = '0px';
  two.style.backgroundPosition = '0px';
  thr.style.backgroundPosition = '0px';
  target_left = 10;
  target_top = 10;
  horz_dir = 1;
  vert_dir = 1;
}

function game_loop() {
    var to_kill = [];
    //Check if we've hit the top
    if (target_top < 10) {
      vert_dir = vert_dir * -1;
    //Check if we've hit the left
    } else if (target_left > right_bound) {
      horz_dir = horz_dir * -1;
    //Check if we've hit the right
    } else if (target_left < 0) {
      horz_dir = horz_dir * -1;
    //Check if there's a collision with the paddle
    } else if (collision(target, paddle) !== false){
      scorePoint();
      addBlock();
      var theta = collision(target, paddle) * Math.PI;
      //TODO This is a vector...only giving it a direction using this
      var velocity = Math.sqrt(vert_dir * vert_dir + horz_dir * horz_dir);
      vert_dir = Math.cos(theta) * velocity;
      horz_dir = Math.sin(theta) * velocity;
    //Check and see if it's hit the bottom
    } else if (target_top + target.offsetHeight > window.innerHeight - 89){
      reset();
    } else {
        //this will always fail 'cause it only works if one object is bigger in
        //x and y as opposed to just x or just y.
        for (var i = 0, l = blocks.length; i < l; i++) {
            if (collision(blocks[i], target) !== false) {
                scorePoint();
                to_kill.push(i);
                var theta = collision(target, blocks[i]) * Math.PI;
                //TODO This is a vector...only giving it a direction using this
                var velocity = Math.sqrt(vert_dir * vert_dir + horz_dir * horz_dir);
                vert_dir = Math.cos(theta) * velocity;
                horz_dir = Math.sin(theta) * velocity;
                addBlock();
            }
        }
    }
    for (var j = 0, l = to_kill.length; j < l; j++) {
        removeBlock(blocks[to_kill[j]]);
        delete blocks[to_kill[j]];
    }
    //We move
    target_left = target_left + (step * horz_dir);
    target_top = target_top + (step * vert_dir);
    //then we redraw
    target.style.top = (target_top + (step * vert_dir) + step) + "px";
    target.style.left = (target_left + (step * horz_dir) + step) + "px";
}

//this is where the magic all starts!
var animation = setInterval(game_loop, speed);

//---------------------EVENT LISTENER'S GO HERE-----------------------//
//clicking pauses the game
document.addEventListener('click', pause);

//scrolling up or down increases/decreases the game speed
document.addEventListener('mousewheel', function(e) {
    if (e.wheelDelta > 0) {
      step = Math.min(step+1, 10);
    } else {
      step = Math.max(step-1, 1);
    }
});

//moving the moust moves the paddle
document.addEventListener('mousemove', function(e){
    if (!paused) {
        var pad_box = paddle.getBoundingClientRect();
        var mid = pad_box.width / 2;
        if (e.x < window.innerWidth - mid && e.x > mid) {
          paddle.style.left = e.x - mid + 'px';
        }
    }
});


//if you resize the window, things still stay sane.
window.addEventListener('resize', function() {
    right_bound = window.innerWidth - target.offsetWidth - 10;
    bottom_bound = window.innerHeight - target.offsetHeight - 10;
});

