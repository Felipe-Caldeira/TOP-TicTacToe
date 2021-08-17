// Gameboard object
var gameboard = (function() {
    'use strict';

    var _gbArray = [0, 0, 0,
                    0, 0, 0,
                    0, 0, 0];

    var _winningIndeces = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function checkWinCondition() {
        for (line of _winningIndeces) {
            if (_gbArray[line[0]] === _gbArray[line[1]] && _gbArray[line[0]] === _gbArray[line[2]]) {
                return line[0]; // Return the player who won
            }
        }
        return false;
    }

    function resetBoard() {
        // Clears the board
        _gbArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }


    function executeMove(idx, symbol) {
        // Tries to play 'symbol' at index 'idx'. Returns true/false, and changes the board.
        if (!_gbArray[idx]) {
            _gbArray[idx] = symbol;
            return true;
        } else {
            return False
        }
    }

    function renderBoard() {
        console.log(_gbArray);
    }

    return { resetBoard, executeMove, checkWinCondition, renderBoard }
})()


// Player object
function playerFactory(name, symbol) {
    var name = name;
    var symbol = symbol;

    function makeMove() {
        // Prompts user/comp to make their move. Returns index of tile played.

    }

    return { name, symbol, makeMove }
}

// GameController object
var gameController = (function() {
    'use strict';

    var _player1, _player2;
    var _currentTurnPlayer;

    function _initializeGame() {
        // Determine the players
        _player1 = playerFactory(prompt("Player 1 name:"), "X");
        _player2 = playerFactory(prompt("Player 2 name:"), "O");

        _currentTurnPlayer = _player1;
    }

    function _changeTurn() {
        if (_player1 === _currentTurnPlayer) {
            _currentTurnPlayer = _player2;
        } else {
            _currentTurnPlayer = _player1;
        }
    }

    function startGame() {
        _initializeGame();

        // Main game loop
        while (true) {
            console.log(`${_currentTurnPlayer.name}'s turn.`);

            let move = _players[_currentTurnPlayer].makeMove();
            if (!gameboard.executeMove(move, _currentTurnPlayer)) {
                console.log("That spot is already taken.");
            } else {
                _changeTurn();
            }

            gameboard.renderBoard();

            let potentialWinner = gameboard.checkWinCondition();
            if (potentialWinner) {
                console.log(`${potentialWinner.name} won!`);
            }


        }
    }

    function resetGame() {
        // Called when a reset button is called. 
    }


    return { startGame, resetGame }
})()