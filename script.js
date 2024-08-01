const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cellSize = 40;
const colors = ['#FF0000', '#0000FF']; // Player colors: Red and Blue
const specialCells = [
    { type: 'double', color: '#00FF00' }, // Double size of region
    { type: 'reverse', color: '#FFFF00' }, // Reverse colors of adjacent cells
    { type: 'block', color: '#FF00FF' }, // Block an area
    { type: 'reveal', color: '#00FFFF' }  // Reveal empty cells
];

let grid = [];
let specialCellGrid = [];
let currentPlayer = 0;
let gameOver = false;
let playerBlockCount = 0;
let aiBlockCount = 0;
const maxBlockUses = 5;

canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

function initGrid() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    specialCellGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    placeSpecialCells();
    drawGrid();
    gameOver = false;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('restartButton').style.display = 'none';
    updateScores();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if (grid[y][x] !== null) {
                ctx.fillStyle = colors[grid[y][x]];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (specialCellGrid[y][x] !== null) {
                ctx.fillStyle = specialCells[specialCellGrid[y][x]].color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function placeSpecialCells() {
    for (let i = 0; i < 5; i++) {
        let x = Math.floor(Math.random() * gridSize);
        let y = Math.floor(Math.random() * gridSize);
        specialCellGrid[y][x] = Math.floor(Math.random() * specialCells.length);
    }
}

canvas.addEventListener('click', (e) => {
    if (!gameOver && currentPlayer === 0) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        if (grid[y][x] === null) {
            grid[y][x] = currentPlayer;
            applySpecialCellEffects(x, y);
            if (checkForGameOver()) {
                endGame();
                return;
            }
            drawGrid();
            updateScores();
            currentPlayer = 1; // Switch to AI
            setTimeout(aiMove, 500); // AI moves after a short delay
        }
    }
});

function applySpecialCellEffects(x, y) {
    switch (specialCellGrid[y][x]) {
        case 0: doubleRegion(x, y); break;
        case 1: reverseColors(x, y); break;
        case 2: if (currentPlayer === 0 && playerBlockCount < maxBlockUses || currentPlayer === 1 && aiBlockCount < maxBlockUses) {
                    blockArea(x, y);
                    currentPlayer === 0 ? playerBlockCount++ : aiBlockCount++;
                }
                break;
        case 3: revealEmptyCells(x, y); break;
    }
}

function doubleRegion(x, y) {
    // Implement the logic to double the size of the player's region
    console.log('Double region effect applied.');
}

function reverseColors(x, y) {
    const adjacentCells = [
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x, y: y - 1 },
        { x: x, y: y + 1 }
    ];
    adjacentCells.forEach(cell => {
        if (cell.x >= 0 && cell.x < gridSize && cell.y >= 0 && cell.y < gridSize) {
            if (grid[cell.y][cell.x] !== null) {
                grid[cell.y][cell.x] = 1 - grid[cell.y][cell.x];
            }
        }
    });
}

function blockArea(x, y) {
    // Example: Block a 2x2 area around the special cell
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newX = x + i;
            const newY = y + j;
            if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                grid[newY][newX] = null; // Block the cell (make it neutral)
            }
        }
    }
    drawGrid();
}

function revealEmptyCells(x, y) {
    // Example: Reveal a 3x3 area around the special cell
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newX = x + i;
            const newY = y + j;
            if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                if (grid[newY][newX] === null) {
                    grid[newY][newX] = currentPlayer; // Reveal as the current player's color
                }
            }
        }
    }
    drawGrid();
}

function aiMove() {
    let emptyCells = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === null) {
                emptyCells.push({ x, y });
            }
        }
    }
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.y][randomCell.x] = currentPlayer;
        applySpecialCellEffects(randomCell.x, randomCell.y);
        if (checkForGameOver()) {
            endGame();
            return;
        }
        drawGrid();
        updateScores();
        currentPlayer = 0; // Switch back to player
    }
}

function checkForGameOver() {
    // Check if there are any empty cells left
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === null) {
                return false;
            }
        }
    }
    return true;
}

function endGame() {
    gameOver = true;
    const player1Score = countCellsForPlayer(0);
    const player2Score = countCellsForPlayer(1);
    let winner = '';
    if (player1Score > player2Score) {
        winner = 'Player 1 (Red) Wins!';
    } else if (player2Score > player1Score) {
        winner = 'AI (Blue) Wins!';
    } else {
        winner = 'It\'s a Draw!';
    }
    document.getElementById('winnerText').textContent = winner;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('restartButton').style.display = 'block'; // Show the restart button
}

function countCellsForPlayer(player) {
    let count = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === player) {
                count++;
            }
        }
    }
    return count;
}

function updateScores() {
    document.getElementById('playerScore').textContent = `Player 1 (Red): ${countCellsForPlayer(0)}`;
    document.getElementById('aiScore').textContent = `AI (Blue): ${countCellsForPlayer(1)}`;
}

document.getElementById('resetButton').addEventListener('click', initGrid);
document.getElementById('restartButton').addEventListener('click', () => {
    initGrid();
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('restartButton').style.display = 'none'; // Hide restart button after restart
});

document.getElementById('rulesButton').addEventListener('click', () => {
    const rulesSection = document.getElementById('rules');
    if (rulesSection.classList.contains('hidden')) {
        rulesSection.classList.remove('hidden');
        document.getElementById('rulesButton').textContent = 'Hide Rules';
    } else {
        rulesSection.classList.add('hidden');
        document.getElementById('rulesButton').textContent = 'Show Rules';
    }
});

// Initialize the game
initGrid();
