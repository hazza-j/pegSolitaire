document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const restartButton = document.getElementById('restart-button');
    const undoButton = document.getElementById('undo-button');
    const message = document.getElementById('message');
    let holes = [];
    let selectedPeg = null;
    let history = [];

    function createBoard() {
        board.innerHTML = '';
        holes = [];
        for (let row = 0; row < 8; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row');
            for (let col = 0; col <= row; col++) {
                const hole = document.createElement('div');
                hole.classList.add('hole');
                if (row === 4 && col === 2) {
                    hole.classList.add('empty');
                } else {
                    hole.classList.add('peg');
                }
                hole.dataset.row = row;
                hole.dataset.col = col;
                holes.push(hole);
                rowDiv.appendChild(hole);
            }
            board.appendChild(rowDiv);
        }

        holes.forEach(hole => {
            hole.addEventListener('click', () => {
                if (hole.classList.contains('peg')) {
                    selectPeg(hole);
                } else if (hole.classList.contains('empty')) {
                    movePeg(hole);
                }
            });

            hole.addEventListener('dragstart', (event) => {
                if (hole.classList.contains('peg')) {
                    event.dataTransfer.setData('text/plain', JSON.stringify({
                        row: hole.dataset.row,
                        col: hole.dataset.col
                    }));
                }
            });

            hole.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            hole.addEventListener('drop', (event) => {
                event.preventDefault();
                const fromData = JSON.parse(event.dataTransfer.getData('text/plain'));
                const fromHole = holes.find(h => 
                    parseInt(h.dataset.row) === parseInt(fromData.row) && 
                    parseInt(h.dataset.col) === parseInt(fromData.col)
                );
                const toHole = event.target;

                if (toHole.classList.contains('empty')) {
                    const overRow = (parseInt(fromData.row) + parseInt(toHole.dataset.row)) / 2;
                    const overCol = (parseInt(fromData.col) + parseInt(toHole.dataset.col)) / 2;
                    const overHole = holes.find(h => 
                        parseInt(h.dataset.row) === overRow && 
                        parseInt(h.dataset.col) === overCol
                    );

                    if (overHole && overHole.classList.contains('peg')) {
                        fromHole.classList.remove('peg');
                        fromHole.classList.add('empty');
                        overHole.classList.remove('peg');
                        overHole.classList.add('empty');
                        toHole.classList.remove('empty');
                        toHole.classList.add('peg');
                        saveState();
                        checkGameOver();
                    }
                }
            });
        });

        history = [];
        saveState();
    }

    function selectPeg(hole) {
        if (selectedPeg) {
            selectedPeg.classList.remove('selected');
        }
        selectedPeg = hole;
        selectedPeg.classList.add('selected');
    }

    function movePeg(targetHole) {
        if (!selectedPeg) return;

        const srcRow = parseInt(selectedPeg.dataset.row);
        const srcCol = parseInt(selectedPeg.dataset.col);
        const tgtRow = parseInt(targetHole.dataset.row);
        const tgtCol = parseInt(targetHole.dataset.col);

        const midRow = (srcRow + tgtRow) / 2;
        const midCol = (srcCol + tgtCol) / 2;

        const midHole = holes.find(hole => 
            parseInt(hole.dataset.row) === midRow && 
            parseInt(hole.dataset.col) === midCol
        );

        if (midHole && midHole.classList.contains('peg')) {
            selectedPeg.classList.remove('peg');
            selectedPeg.classList.add('empty');
            midHole.classList.remove('peg');
            midHole.classList.add('empty');
            targetHole.classList.remove('empty');
            targetHole.classList.add('peg');
            selectedPeg.classList.remove('selected');
            selectedPeg = null;
            saveState();
            checkGameOver();
        }
    }

    function saveState() {
        const state = holes.map(hole => hole.className);
        history.push(state);
    }

    function undoMove() {
        if (history.length > 1) {
            history.pop();
            const previousState = history[history.length - 1];
            holes.forEach((hole, index) => {
                hole.className = previousState[index];
            });
            message.textContent = '';
        }
    }

    function checkGameOver() {
        const pegs = holes.filter(hole => hole.classList.contains('peg'));
        if (pegs.length === 1) {
            const lastPeg = pegs[0];
            if (parseInt(lastPeg.dataset.row) === 4 && parseInt(lastPeg.dataset.col) === 2) {
                message.textContent = 'You win!';
            } else {
                message.textContent = 'You lose!';
            }
        } else if (!hasValidMoves()) {
            message.textContent = 'No more valid moves. You lose!';
        }
    }

    function hasValidMoves() {
        for (let hole of holes) {
            if (hole.classList.contains('peg')) {
                const row = parseInt(hole.dataset.row);
                const col = parseInt(hole.dataset.col);
                const moves = generateMoves(row, col);
                for (let move of moves) {
                    const targetHole = holes.find(h => 
                        parseInt(h.dataset.row) === move.row && 
                        parseInt(h.dataset.col) === move.col
                    );
                    const midRow = (row + move.row) / 2;
                    const midCol = (col + move.col) / 2;
                    const midHole = holes.find(h => 
                        parseInt(h.dataset.row) === midRow && 
                        parseInt(h.dataset.col) === midCol
                    );
                    if (targetHole && targetHole.classList.contains('empty') && midHole && midHole.classList.contains('peg')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function generateMoves(row, col) {
        return [
            { row: row - 2, col: col },
            { row: row + 2, col: col },
            { row: row, col: col - 2 },
            { row: row, col: col + 2 },
            { row: row - 2, col: col - 2 },
            { row: row + 2, col: col + 2 }
        ];
    }

    restartButton.addEventListener('click', () => {
        createBoard();
        message.textContent = '';
    });

    undoButton.addEventListener('click', () => {
        undoMove();
    });

    createBoard();
});