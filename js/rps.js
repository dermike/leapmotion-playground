var rps = {
  state: 'waiting',
  computerChoice: null,
  userChoice: null,
  computerScore: 0,
  userScore: 0,
  gameText: document.getElementById('game'),
  gameStatus: document.getElementById('status'),
  
  init: function() {
    if ((typeof(WebSocket) == 'undefined') && (typeof(MozWebSocket) != 'undefined')) {
      WebSocket = MozWebSocket;
    };
    ws = new WebSocket("ws://localhost:6437/");

    ws.onopen = function(event) {
      ws.send(JSON.stringify({"enableGestures": true}));
      rps.gameText.innerHTML = 'Rock, paper, scissors!';
      rps.gameStatus.innerHTML = 'Start by swiping to the left';
      rps.updateScore();
    };

    ws.onmessage = function(event) {
      var leap = JSON.parse(event.data);
      if (rps.state == 'waiting') {
      	if (leap.gestures.length > 0 && leap.gestures[0].type == 'swipe' && leap.gestures[0].direction[0] < 0) {
      	  rps.gameOn();
      	}
      } else if (rps.state == 'gameon') {
      	switch (leap.pointables.length) {
          case 0:
            rps.userChoice = 'rock';
            break;
          case 1:
            rps.userChoice = 'paper';
            break;
          case 2:
            rps.userChoice = 'scissors';
            break;
          case 3:
            rps.userChoice = 'paper';
            break;
          case 4:
            rps.userChoice = 'paper';
            break;
          case 5:
            rps.userChoice = 'paper';
            break;
          default:
            rps.userChoice = 'rock';
            break;
      	}
      	rps.gameStatus.innerHTML = 'You: ' + rps.userChoice;
      }
    };

    ws.onclose = function(event) {
      ws = null;
      rps.gameText.innerHTML = 'Connection closed';
    };

    ws.onerror = function(event) {
      rps.gameText.innerHTML = 'Connection error';
    };
  },

  gameOn: function() {
  	rps.state = 'gameon';
  	rps.gameText.innerHTML = 'Allright, game on!';
  	var delay = 1000;
  	window.setTimeout(function() {
  	  rock();
  	}, delay);

    function rock() {
      rps.gameText.innerHTML = 'Rock...';
      window.setTimeout(function() {
        paper();
      }, delay);
    }

    function paper() {
      rps.gameText.innerHTML = 'Paper...';
      window.setTimeout(function() {
        scissor();
      }, delay);
    }

    function scissor() {
      rps.gameText.innerHTML = 'Scissors...';
      window.setTimeout(function() {
        match();
      }, delay);
    }

    function match() {
      rps.gameText.innerHTML = 'Match!';
      window.setTimeout(function() {
        rps.winning();
      }, delay);
    }
  },

  winning: function() {
    rps.state = 'matching';

    // Randomize computer response
    rps.computerChoice = ['rock', 'paper', 'scissors'].shuffle()[Math.floor(Math.random()*3)];
    var userwon, whowon;

    switch (rps.computerChoice) {
      case 'rock':
        if (rps.userChoice == 'rock') {
          userwon = true;
        } else if (rps.userChoice == 'paper') {
          userwon = true;
        } else {
          userwon = false;
        }
        break;
      case 'paper':
        if (rps.userChoice == 'rock') {
          userwon = false;
        } else if (rps.userChoice == 'paper') {
          userwon = true;
        } else {
          userwon = true;
        }
        break;
      case 'scissors':
        if (rps.userChoice == 'rock') {
          userwon = true;
        } else if (rps.userChoice == 'paper') {
          userwon = false;
        } else {
          userwon = true;
        }
        break;
    }
    if (userwon) {
      if (rps.userChoice === rps.computerChoice) {
      	whowon = 'Even! Wanna try again?';
      } else {
      	whowon = 'You won! ' + rps.userChoice + ' beats ' + rps.computerChoice;
      	rps.updateScore('user');
      }
    } else {
      whowon = 'I won! ' + rps.computerChoice + ' beats ' + rps.userChoice;
      rps.updateScore('computer');
    }
  	
  	rps.gameText.innerHTML = whowon;
  	rps.gameStatus.innerHTML = 'Swipe left to play again...';
  	rps.state = 'waiting';
  },

  updateScore: function(oneup) {
  	if (oneup == 'user') {
  	  rps.userScore++;
  	} else if (oneup == 'computer') {
  	  rps.computerScore++
  	}
  	document.getElementById('userscore').getElementsByClassName('score')[0].innerHTML = rps.userScore;
    document.getElementById('computerscore').getElementsByClassName('score')[0].innerHTML = rps.computerScore;
  }

}

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if (i == 0) return this;
  while (--i) {
     j = Math.floor(Math.random() * (i + 1));
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

rps.init();