// Player factory function
function playerFactory(name, symbol) {
    var name = name;
    var symbol = symbol;
    var isCPU = false;

    function makeCPUMove() {
        // Logic for CPU's turn
        let move = cpuAI.makeMove(gameboard.getStateForAI());
        setTimeout(() => {gameboard.executeMove(document.querySelector(`.cell[data-idx='${move}']`), this);}, 1000);
    }
    
    return { name, symbol, isCPU, makeCPUMove }
}

// Gameboard module
var gameboard = (function() {
    'use strict';

    var _gbArray = [0, 0, 0,
                    0, 0, 0,
                    0, 0, 0
    ];
    var _freeSpaces = 9;
    var _cells = document.querySelectorAll(".cell");
    var _winLine = document.getElementById("winLine"); 
    
    var winningIndeces = [
    [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    
    function _cellCoords(cell, canvasSize, cellSize) {
        return {
            x: ((cellSize / 2) + (cellSize * cell)) % canvasSize,
            y: (cell > 5) ? cellSize * (5 / 2) :
                (cell > 2) ? cellSize * (3 / 2) :
                (cellSize / 2)
        }
    }

    function _drawWinLine(cell1, cell2) {
        let boardSize = document.querySelector(".gameboard").offsetWidth;
        let cellSize = boardSize / 3;

        cell1 = _cellCoords(cell1, boardSize, cellSize);
        cell2 = _cellCoords(cell2, boardSize, cellSize);

        _winLine.setAttribute("points", `${cell1.x},${cell1.y} ${cell2.x},${cell2.y}`);
        _winLine.style.opacity = "100%";
    }

    function getStateForAI() {
        let stateRep = [];
        for (const cell of _gbArray) {
            if (cell === 0) {
                stateRep.push(0);
            } else if (cell.name == "Computer") {
                stateRep.push(1);
            } else {
                stateRep.push(-1);
            }
        }
        return stateRep;
    }

    function checkWinCondition() {
        // Check all of winning indeces
        for (const line of winningIndeces) {
            if (_gbArray[line[0]] && _gbArray[line[0]] === _gbArray[line[1]] && _gbArray[line[0]] === _gbArray[line[2]]) {
                _cells.forEach(cell => cell.classList.add("taken"));
                _drawWinLine(line[0], line[2]);
                return { end: true, winner: _gbArray[line[0]] }; // Return the player who won
            }
        }

        // Check if it's a tie
        if (_freeSpaces === 0) {
            return { end: true, winner: "tie" };
        }

        return { end: false, winner: undefined };
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

        // Clear win line
        _winLine.setAttribute("points", "");
        _winLine.style.opacity = "0%";

        renderBoard();
    }

    function executeMove(cell, player) {
        if (player === undefined || gameController.getGameWon()) { return; }

        
        let idx = cell.dataset.idx - 0;
        if (!_gbArray[idx]) {
            console.log(player.name + " just made a play.");
            _gbArray[idx] = player;
            _freeSpaces -= 1;
            cell.classList.add("taken");
            gameController.changeTurn();
        } 
    }

    function renderBoard() {
        _cells.forEach(cell => {
            let idx = cell.dataset.idx - 0;
            cell.innerHTML = _gbArray[idx] ? _gbArray[idx].symbol : "";
        });
    }

    return { winningIndeces, resetBoard, executeMove, checkWinCondition, initializeBoard, renderBoard, getStateForAI }
})();

// GameController module
var gameController = (function() {
    'use strict';
    
    var _player1, _player2;
    var _currentTurnPlayer;
    var _gameWon = false;
    var _mainContainer = document.querySelector(".mainContainer");
    var _mainMenu = document.querySelector(".mainMenu");
    var _gameText = document.querySelector(".gameText");
    
    function toggleMainMenu() {
        let style = window.getComputedStyle(_mainMenu);
        if (style.getPropertyValue("display") === "flex") {
            _mainContainer.style.display = "flex";
            _mainMenu.style.display = "none";
        } else {
            _mainContainer.style.display = "none";
            _mainMenu.style.display = "flex";
            resetGame();
        }
    }

    function changeTurn() {
        if (_player1 === _currentTurnPlayer) {
            _currentTurnPlayer = _player2;
        } else {
            _currentTurnPlayer = _player1;
        }
        updateGame();
        if (_currentTurnPlayer.isCPU) {
            _currentTurnPlayer.makeCPUMove();
        }
    }

    function gameText(str) {
        _gameText.innerHTML = str;
    }

    function getCurrentTurnPlayer() {
        return _currentTurnPlayer;
    }

    function getGameWon() {
        return _gameWon;
    }

    function startGame(mode) {
        if (mode === "single") {
            _player1 = playerFactory(prompt("Player name:"), "X");
            _player2 = playerFactory("Computer", "O");
            _player2.isCPU = true;
        } else {
            _player1 = playerFactory(prompt("Player 1 name:"), "X");
            _player2 = playerFactory(prompt("Player 2 name:"), "O");
        }
        if (_player1.name === "") { _player1.name = "Player 1"; }
        if (_player2.name === "") { _player2.name = "Player 2"; }

        _currentTurnPlayer = _player1;
        toggleMainMenu()
        gameboard.initializeBoard();
        updateGame();
    }

    function updateGame() {
        // Render the new gameboard, check for winners
        gameboard.renderBoard();

        let potentialWinner = gameboard.checkWinCondition();
        if (potentialWinner.end) {
            if (potentialWinner.winner !== "tie") {
                gameText(`${potentialWinner.winner.name} won!`);
            } else {
                gameText("It's a cat's game!");
            }
            _gameWon = true;
        } else {
            gameText(`It's ${_currentTurnPlayer.name}'s turn.`);
        }
    }

    function resetGame() {
        // Called when a reset button is called. 
        _gameWon = false;
        gameboard.resetBoard();
        if (_currentTurnPlayer.isCPU) {_currentTurnPlayer.makeCPUMove();}
        updateGame();
    }

    return { startGame, updateGame, resetGame, getCurrentTurnPlayer, getGameWon, changeTurn, toggleMainMenu }
})();

// AI Module
var cpuAI = (function() {
    var AI = minimaxAI(_stateFacFn, _genChildrenFn, _gameoverFn, _nextMoveFn);

    function _stateFacFn(rawState) {
        return {
            rep: rawState,
            requiredMove: undefined,
            maxPlayer: true
        }
    }

    function _genChildrenFn(state) {
        let children = [];
        for (let idx = 0; idx < state.rep.length; idx++) {
            if (state.rep[idx] === 0) {
                let newRep = [...state.rep];
                newRep[idx] = state.maxPlayer ? 1 : -1;
                children.push({
                    rep: newRep,
                    requiredMove: idx,
                    maxPlayer: !state.maxPlayer
                })      
            }
        }
        return children;
    }

    function _gameoverFn(state) {
        // Win for cpu is 1, win for player is -1, tie is 0. No game over is false.
        for (const line of gameboard.winningIndeces) {
            if (state.rep[line[0]] && state.rep[line[0]] === state.rep[line[1]] && state.rep[line[0]] === state.rep[line[2]]) {
                return state.rep[line[0]]; // Return the player who won
            }
        }
        let emptyCellCount = state.rep.reduce((n, x) => n + (x === 0), 0);
        return (emptyCellCount === 0) ? 0 : false;
    }

    function _nextMoveFn(optimalNextState) {
        return optimalNextState.requiredMove;
    }

    function makeMove(rawState) {
        return AI.makeMove(rawState);
    }
    
    function showTree(rawState) {
        return AI.showTree(rawState);
    }

    return { makeMove, showTree }
})();


function start() {
    document.getElementById("startSingle").addEventListener("click", () => { gameController.startGame("single"); });
    document.getElementById("startVS").addEventListener("click", () => { gameController.startGame("vs"); });
    document.getElementById("resetButton").addEventListener("click", gameController.resetGame);
    document.getElementById("menuButton").addEventListener("click", gameController.toggleMainMenu);
}

window.onload = start;