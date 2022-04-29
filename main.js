var holder = document.getElementById('holder'),
  state = document.getElementById('status'),
  upload_message = document.getElementById('upload_message'),
  uploaded_files_box = document.getElementById('uploaded_files_box'),
  step_1 = document.getElementById('step-1'),
  step_2 = document.getElementById('step-2'),
  settingsform = document.getElementById('settingsform'),
  game_canvas = document.getElementById('game-canvas'),
  game_image = document.getElementById('game-image');

var files = [];
var current_image = 0;
var random_cells;

var number_of_parts = 15;
var pixelate = false;
var myPixelation;
var pixelate_resolution;

var number_of_parts_left;

if (typeof window.FileReader === 'undefined') {
  state.classList.add('fail');
} else {
  state.classList.add('success');
  state.innerHTML = 'File API & FileReader available';
}

holder.ondragover = function() {
  this.className = 'hover';
  return false;
};
holder.ondragend = function() {
  this.className = '';
  return false;
};
holder.ondrop = function(e) {
  this.className = '';
  e.preventDefault();


  files = e.dataTransfer.files;

  upload_message.innerHTML = "Selected " + files.length + " files.";
  upload_message.classList.remove('hidden');
  step_1.classList.add('hidden');
  step_2.classList.remove('hidden');

  settingsform.addEventListener('input', numberOfParts_on_input);
  // and for IE 11
  document.getElementById('numberOfParts').addEventListener('change', numberOfParts_on_input);

  window.setTimeout(function() { // hide alert message
    upload_message.classList.add('hidden');
  }, 5000);

  settingsform.addEventListener('submit', evaluate_settings_form);

  return false;
};

function numberOfParts_on_input(e) {
  document.getElementById('numberOfPartsOutput').innerHTML = document.getElementById('numberOfParts').value;
}

function evaluate_settings_form(e) {
  e.preventDefault();
  number_of_parts = document.getElementById('numberOfParts').value;
  pixelate = document.getElementById('pixelate').checked;
  document.getElementById('header').classList.add('hidden');
  document.getElementById('jumbotron').classList.add('hidden');
  document.getElementById('container').className = 'container-fluid';
  game_canvas.classList.remove('hidden');
  game_image.classList.remove('hidden');
  game();
  return false;
}

function game() {
  document.getElementsByTagName("body")[0].style.backgroundColor = 'black';
  document.getElementById('start-button').disabled = true;

  // to hide everything
  game_canvas.style.top = '0';
  game_canvas.style.left = '0';
  game_canvas.width = document.documentElement.clientWidth;
  game_canvas.height = document.documentElement.clientHeight;

  var objContext = game_canvas.getContext('2d');
  objContext.fillStyle = "black";
  objContext.fillRect(0, 0, game_canvas.width, game_canvas.height);

  game_image.src = '';
  upload_message.classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  game_image.style.top = '0';
  game_canvas.classList.remove('hidden');
  // document.getElementById('game').height = document.documentElement.clientHeight;
  var reader = new FileReader();

  reader.onload = function(event) {
    // console.log(event.target);

    var img = new Image();
    img.src = event.target.result;
    game_image.classList.remove('limit-height');
    img.onload = function() {
      if (img.height > document.documentElement.clientHeight) {
        game_image.classList.add('limit-height');
      } else {
        var space = (document.documentElement.clientHeight - img.height) / 2;
        game_image.style.top = space + 'px';
      }
      game_image.src = event.target.result;

      game_image.onload = function() {
        var dimension = [game_image.offsetWidth, game_image.offsetHeight];
        console.log(dimension);

        // to fix problems with same width rendered differently on different elements
        // better give the canvas 1 pixel more
        dimension[0]++;

        game_canvas.width = dimension[0];
        game_canvas.height = dimension[1];
        game_canvas.style.top = game_image.offsetTop + 'px';
        game_canvas.style.left = game_image.offsetLeft + 'px';

        if (pixelate) {
          myPixelation = new ClosePixelation(game_image, [{
            resolution: 24
          }]);
        }

        VoronoiRenderer.init(game_canvas, number_of_parts, game_canvas.width, game_canvas.height);
        random_cells = [];

        for (var i = 0; i < number_of_parts; i++) {
          random_cells.push(i);
        }
        shuffle(random_cells);
        step(number_of_parts);
        number_of_parts_left = number_of_parts;
        document.addEventListener ('keydown',  reportKeyEvent);
      };
    };
  };
  console.log(files[current_image]);
  reader.readAsDataURL(files[current_image]);
}

function step(n) {
  if (n === 0) {
    current_image++;
    if (current_image >= files.length) {
      // reset everything
      current_image = 0;
      game_canvas.classList.add('hidden');
      game_image.classList.add('hidden');
      document.getElementsByTagName("body")[0].style.backgroundColor = 'white';
      document.getElementById('start-button').disabled = false;
      document.onkeypress = null;
      document.getElementById('header').classList.remove('hidden');
      document.getElementById('jumbotron').classList.remove('hidden');
      document.getElementById('container').className = 'container';
      step_1.classList.remove('hidden');
      step_2.classList.add('hidden');
      document.removeEventListener('keydown',  reportKeyEvent);
    } else {
      game();
    }
  } else {
    var ctx = game_canvas.getContext('2d');
    ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
    random_cells.pop();
    for (var i = 0; i <= random_cells.length; i++) {
      VoronoiRenderer.renderCell(random_cells[i], 'black', 'black');
    }

    if (pixelate) {
      var new_resolution;
      if (n / number_of_parts < 0.4) {
        new_resolution = 1;
      } else if (n / number_of_parts < 0.7) {
        new_resolution = 16;
      } else {
        new_resolution = 24;
      }

      if (new_resolution !== pixelate_resolution) {
        if (new_resolution === 1) {
          myPixelation.canvas.parentNode.replaceChild(myPixelation.img, myPixelation.canvas);
        } else {
          myPixelation.render([{
            resolution: new_resolution
          }]);
        }
        pixelate_resolution = new_resolution;
      }
      console.log(new_resolution);
    }
  }
}

function reportKeyEvent (zEvent) {

  //--- Was a Ctrl-Space pressed?
  if (zEvent.ctrlKey && zEvent.key === " ") {
    this.hitCnt = ( this.hitCnt || 0 ) + 1;
    while (number_of_parts_left > 0){
      step(number_of_parts_left --)
    }
  } else if (!zEvent.ctrlKey){
    step(number_of_parts_left --);
  }
  zEvent.stopPropagation ();
  zEvent.preventDefault ()
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}