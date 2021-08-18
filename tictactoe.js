// Gameboard module
var gameboard = (function() {
    'use strict';

    var _gbArray = [0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ];

    var _freeSpaces = 9;

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

    var _cells = document.querySelectorAll(".cell");


    function checkWinCondition() {
        // Check all of winning indeces
        for (const line of _winningIndeces) {
            if (_gbArray[line[0]] && _gbArray[line[0]] === _gbArray[line[1]] && _gbArray[line[0]] === _gbArray[line[2]]) {
                _cells.forEach(cell => cell.classList.add("taken"));
                return {end: true, winner: _gbArray[line[0]]}; // Return the player who won
            }
        }

        // Check if it's a tie
        if (_freeSpaces === 0) {
            return {end: true, winner: "tie"};
        }

        return {end: false, winner: undefined};
    }

    function initializeBoard() {
        resetBoard();
        _cells.forEach(cell => cell.addEventListener("click", (e) => executeMove(e.currentTarget, gameController.getCurrentTurnPlayer())));
        renderBoard();
    }

    function resetBoard() {
        // Clear the board
        _gbArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Reset cell classes
        _cells.forEach(cell => cell.classList.remove('taken'));

        _freeSpaces = 9;

        renderBoard();
    }

    function executeMove(cell, player) {
        if (player === undefined || gameController.getGameWon()) { return; }

        console.log(player.name + " just made a play.");

        let idx = cell.dataset.idx - 0;
        if (!_gbArray[idx]) {
            _gbArray[idx] = player;
            _freeSpaces -= 1;
            cell.classList.add("taken");
            gameController.changeTurn();
        } else {
            console.log("Taken!");
        }

        gameController.updateGame();
    }

    function renderBoard() {
        _cells.forEach(cell => {
            let idx = cell.dataset.idx - 0;
            cell.innerHTML = _gbArray[idx] ? _gbArray[idx].symbol : "";
        });
    }

    return { resetBoard, executeMove, checkWinCondition, initializeBoard, renderBoard }
})()


// Player factory function
function playerFactory(name, symbol) {
    var name = name;
    var symbol = symbol;

    return { name, symbol }
}

// GameController module
var gameController = (function() {
    'use strict';

    var _player1, _player2;
    var _currentTurnPlayer;
    var _gameWon = false;
    

    function changeTurn() {
        if (_player1 === _currentTurnPlayer) {
            _currentTurnPlayer = _player2;
        } else {
            _currentTurnPlayer = _player1;
        }
    }
    
    function getCurrentTurnPlayer() {
        return _currentTurnPlayer;
    }

    function getGameWon() {
        return _gameWon;
    }

    function startGame() {
        // Determine the players
        _player1 = playerFactory(prompt("Player 1 name:"), "X");
        _player2 = playerFactory(prompt("Player 2 name:"), "O");

        _currentTurnPlayer = _player1;
        gameboard.initializeBoard();
    }

    function updateGame() {
        // Render the new gameboard, check for winners
        gameboard.renderBoard();

        let potentialWinner = gameboard.checkWinCondition();
        if (potentialWinner.end) {
            if (potentialWinner.winner !== "tie") {
                console.log(`${potentialWinner.winner.name} won!`);
            } else {
                console.log("It's a cat's game!");
            }
            _gameWon = true;
        }
    }

    function resetGame() {
        // Called when a reset button is called. 
        _gameWon = false;
        gameboard.resetBoard();
    }


    return { startGame, updateGame, resetGame, getCurrentTurnPlayer, getGameWon, changeTurn }
})()



function start() {
    gameController.startGame();

    document.querySelector(".resetButton").addEventListener("click", gameController.resetGame);
}

window.onload = start;