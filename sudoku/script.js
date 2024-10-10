let selectedCell = null;
let isOriginalCell = false;

function generateSudoku() {
    // 创建一个空的 9x9 数组
    let board = Array(9).fill().map(() => Array(9).fill(0));

    // 填充数独
    fillBoard(board);

    // 移除一些数字来创建谜题
    removeNumbers(board);

    return board;
}

function fillBoard(board) {
    fillCell(board, 0, 0);
}

function fillCell(board, row, col) {
    if (col === 9) {
        row++;
        col = 0;
    }
    if (row === 9) {
        return true; // 数独已填满
    }

    if (board[row][col] !== 0) {
        return fillCell(board, row, col + 1);
    }

    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);

    for (let num of numbers) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillCell(board, row, col + 1)) {
                return true;
            }
            board[row][col] = 0; // 回溯
        }
    }

    return false;
}

function removeNumbers(board) {
    let cellsToRemove = 40; // 你可以调整这个数字来改变难度
    while (cellsToRemove > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            cellsToRemove--;
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBoard(board) {
    const sudokuBoard = document.getElementById('sudoku-board');
    sudokuBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.block = Math.floor(i / 3) * 3 + Math.floor(j / 3);
            const cellContent = document.createElement('div');
            cellContent.className = 'cell-content';
            const hintGrid = document.createElement('div');
            hintGrid.className = 'hint-grid';
            for (let k = 0; k < 9; k++) {
                const hintCell = document.createElement('div');
                hintCell.className = 'hint-cell';
                hintGrid.appendChild(hintCell);
            }
            cell.appendChild(cellContent);
            cell.appendChild(hintGrid);
            
            if (board[i] && board[i][j]) {
                if (typeof board[i][j] === 'object') {
                    // 加载保存的状态
                    cellContent.textContent = board[i][j].value;
                    if (board[i][j].isOriginal) {
                        cell.classList.add('original');
                        cellContent.classList.add('original');
                    } else if (board[i][j].value) {
                        cellContent.classList.add('player-input');
                    }
                    board[i][j].hints.forEach((hint, index) => {
                        if (hint) {
                            hintGrid.children[index].textContent = hint;
                        }
                    });
                } else {
                    // 处理新生成的数独
                    cellContent.textContent = board[i][j];
                    cell.classList.add('original');
                    cellContent.classList.add('original');
                }
            }
            cell.addEventListener('click', function() {
                selectCell(this);
            });
            sudokuBoard.appendChild(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    cell.classList.add('selected');
    isOriginalCell = cell.classList.contains('original');
    highlightRelatedCells(cell); // 添加这行
    updateNumberPadState();
}

function highlightRelatedCells(cell) {
    // 移除之前的高亮
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('related'));

    if (!cell) return;

    const row = cell.dataset.row;
    const col = cell.dataset.col;
    const block = cell.dataset.block;

    document.querySelectorAll('.cell').forEach(c => {
        if (c.dataset.row === row || c.dataset.col === col || c.dataset.block === block) {
            c.classList.add('related');
        }
    });
}

function getAvailableNumbers(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const block = parseInt(cell.dataset.block);
    const usedNumbers = new Set();

    // 检查同行、同列和同宫的数字
    document.querySelectorAll('.cell').forEach(c => {
        if (c.dataset.row == row || c.dataset.col == col || c.dataset.block == block) {
            const num = c.querySelector('.cell-content').textContent;
            if (num) usedNumbers.add(num);
        }
    });

    // 返回可用的数字
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(num => !usedNumbers.has(num.toString()));
}

function updateNumberPadState() {
    const numberPads = document.querySelectorAll('#number-pad .number-cell, #hint-pad .number-cell');
    if (isOriginalCell || !selectedCell) {
        numberPads.forEach(cell => cell.classList.add('disabled'));
        return;
    }

    const availableNumbers = getAvailableNumbers(selectedCell);
    numberPads.forEach(cell => {
        const number = parseInt(cell.textContent);
        if (availableNumbers.includes(number)) {
            cell.classList.remove('disabled');
        } else {
            cell.classList.add('disabled');
        }
    });
}

function setNumber(cell, number) {
    const cellContent = cell.querySelector('.cell-content');
    cellContent.textContent = number;
    cellContent.classList.add('player-input'); // 添加玩家输入的类
    // 清除所有提示数字
    const hintCells = cell.querySelectorAll('.hint-cell');
    hintCells.forEach(hintCell => hintCell.textContent = '');
    highlightRelatedCells(cell);
    updateNumberPadState(); // 添加这行，以在填入数字后更新数字输入区域
    saveGameState();

    // 检查是否获胜
    if (checkWin()) {
        showWinMessage();
    }
}

function toggleHint(cell, number) {
    const cellContent = cell.querySelector('.cell-content');
    // 如果已经填入确定数字，不允许添加提示数字
    if (cellContent.textContent !== '') {
        return;
    }
    
    const hintCells = cell.querySelectorAll('.hint-cell');
    const index = number - 1;
    if (hintCells[index].textContent === '') {
        hintCells[index].textContent = number;
    } else {
        hintCells[index].textContent = '';
    }
    saveGameState();
}

function createNumberPad(containerId, isHint) {
    const container = document.querySelector(`#${containerId} .number-grid`);
    container.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const numberCell = document.createElement('div');
        numberCell.className = 'number-cell';
        numberCell.textContent = i;
        numberCell.addEventListener('click', () => {
            if (selectedCell && !isOriginalCell) {
                if (isHint) {
                    toggleHint(selectedCell, i);
                } else {
                    setNumber(selectedCell, i);
                }
            }
        });
        container.appendChild(numberCell);
    }
}

function initGame() {
    localStorage.removeItem('sudokuGameState'); // 清除旧的保存状态
    const board = generateSudoku();
    renderBoard(board);
    selectedCell = null;
    isOriginalCell = false;
    updateNumberPadState();
    saveGameState();
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();

    document.getElementById('new-game').addEventListener('click', initGame);

    document.getElementById('solve').addEventListener('click', () => {
        const currentBoard = getCurrentBoard();
        if (solveSudoku(currentBoard)) {
            fillSolution(currentBoard);
            alert('数独已解答！');
        } else {
            alert('无法解答当前数独！');
        }
    });
});

function solveSudoku(board) {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; // 数独已解决
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;

            if (solveSudoku(board)) {
                return true;
            }

            board[row][col] = 0; // 回溯
        }
    }

    return false; // 无解
}

function findEmptyCell(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return null;
}

function isValid(board, row, col, num) {
    // 检查行
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) {
            return false;
        }
    }

    // 检查列
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) {
            return false;
        }
    }

    // 检查3x3方格
    let startRow = row - row % 3,
        startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }

    return true;
}

function fillSolution(solution) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const cellContent = cell.querySelector('.cell-content');
        cellContent.textContent = solution[row][col];
        if (!cell.classList.contains('original')) {
            cellContent.classList.remove('player-input');
            cellContent.classList.add('solution');
        }
    });
}

function getCurrentBoard() {
    const board = [];
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; i++) {
        board[i] = [];
        for (let j = 0; j < 9; j++) {
            const cellContent = cells[i * 9 + j].querySelector('.cell-content');
            board[i][j] = cellContent.textContent ? parseInt(cellContent.textContent) : 0;
        }
    }
    return board;
}

// 添加以下函数来保存和加载游戏状态

function saveGameState() {
    const cells = document.querySelectorAll('.cell');
    const gameState = {
        board: [],
        selectedCell: selectedCell ? {
            row: selectedCell.dataset.row,
            col: selectedCell.dataset.col
        } : null
    };

    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        if (!gameState.board[row]) {
            gameState.board[row] = [];
        }
        const cellContent = cell.querySelector('.cell-content');
        const hintCells = cell.querySelectorAll('.hint-cell');
        gameState.board[row][col] = {
            value: cellContent.textContent,
            isOriginal: cell.classList.contains('original'),
            isPlayerInput: cellContent.classList.contains('player-input'),
            hints: Array.from(hintCells).map(hintCell => hintCell.textContent)
        };
    });

    localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('sudokuGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        renderBoard(gameState.board);
        if (gameState.selectedCell) {
            const cell = document.querySelector(`.cell[data-row="${gameState.selectedCell.row}"][data-col="${gameState.selectedCell.col}"]`);
            if (cell) {
                selectCell(cell);
            }
        }
    } else {
        initGame();
    }
    
    // 添加这两行来创建数字输入面板
    createNumberPad('number-pad', false);
    createNumberPad('hint-pad', true);
    
    updateNumberPadState();
}

// 页面加载时加载游戏状态
window.addEventListener('load', loadGameState);

function checkWin() {
    const cells = document.querySelectorAll('.cell');
    
    // 检查是否所有格子都已填满
    if ([...cells].some(cell => cell.querySelector('.cell-content').textContent === '')) {
        return false;
    }

    // 检查每行、每列和每个3x3宫格是否都包含1-9的数字
    for (let i = 0; i < 9; i++) {
        if (!checkGroup([...cells].filter(cell => cell.dataset.row == i)) ||
            !checkGroup([...cells].filter(cell => cell.dataset.col == i)) ||
            !checkGroup([...cells].filter(cell => cell.dataset.block == i))) {
            return false;
        }
    }

    return true;
}

function checkGroup(cells) {
    const numbers = cells.map(cell => cell.querySelector('.cell-content').textContent);
    const uniqueNumbers = new Set(numbers);
    return uniqueNumbers.size === 9 && !uniqueNumbers.has('');
}

function showWinMessage() {
    alert('恭喜你！你已经成功完成了数独！');
    // 这里可以添加更多胜利后的操作，比如禁用输入、显示用时等
}