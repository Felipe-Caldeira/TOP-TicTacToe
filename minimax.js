function minimaxAI(_stateFacFn, _genChildrenFn, _gameoverFn, _nextMoveFn) {
    var stateFacFn = _stateFacFn;
    var genChildrenFn = _genChildrenFn;
    var gameoverFn = _gameoverFn;
    var nextMoveFn = _nextMoveFn;

    function minimax(state, depth, alpha, beta, maximizingPlayer, debug = false) {
        let gameOverCheck = gameoverFn(state);
        if (typeof(gameOverCheck) === "number") {
            gameOverCheck /= depth;
            if (debug) { console.log("|".repeat(depth) + `State: ${state.rep}, Eval: ${gameOverCheck}, Move made: ${state.requiredMove}`); }
            return { eval: gameOverCheck, optimalNextState: state };
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            let maxEvalChild;
            for (const child of genChildrenFn(state)) {
                let evalState = minimax(child, depth + 1, alpha, beta, false, debug = debug);
                if (evalState.eval > maxEval) {
                    maxEval = evalState.eval;
                    maxEvalChild = child;
                }
                alpha = Math.max(alpha, evalState.eval);
                if (beta <= alpha) { break; }
            }
            if (debug) { console.log("|".repeat(depth) + `[O] State: ${maxEvalChild.rep}, Eval: ${maxEval}, Move made: ${maxEvalChild.requiredMove}`); }
            return { eval: maxEval, optimalNextState: maxEvalChild };
        } else {
            let minEval = Infinity;
            let minEvalChild;
            for (const child of genChildrenFn(state)) {
                let evalState = minimax(child, depth + 1, alpha, beta, true, debug = debug);
                if (evalState.eval < minEval) {
                    minEval = evalState.eval;
                    minEvalChild = child;
                }
                beta = Math.min(beta, evalState.eval);
                if (beta <= alpha) { break; }
            }
            if (debug) { console.log("|".repeat(depth) + `[X] State: ${minEvalChild.rep}, Eval: ${minEval}, Move made: ${minEvalChild.requiredMove}`); }
            return { eval: minEval, optimalNextState: minEvalChild };
        };
    }

    function showTree(rawState, maxPlayer) {
        let currState = stateFacFn(rawState);
        minimax(currState, 0, -Infinity, Infinity, maxPlayer, debug = true);
    }

    function makeMove(rawState) {
        let currState = stateFacFn(rawState);
        let evalState = minimax(currState, 0, -Infinity, Infinity, true);
        return nextMoveFn(evalState.optimalNextState);
    }

    return { makeMove, showTree }
}