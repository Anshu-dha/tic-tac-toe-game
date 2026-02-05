// Shorthand selectors
const $ = s => document.querySelector(s),
      $$ = s => document.querySelectorAll(s),
      getById = id => document.getElementById(id);

// Fade utility
const fade = (el, type) => {
  el.classList.remove(type === 'in' ? 'fadeOut' : 'fadeIn');
  el.classList.add(type === 'in' ? 'fadeIn' : 'fadeOut');
  setTimeout(() => el.style.display = type === 'in' ? 'block' : 'none', 290);
};

// DOM elements
const selection = $('.selection'),
      playBoard = $('.play-board'),
      winner = $('.winner'),
      difficultyBox = $('.difficulty'),
      cells = $$('.cell'),
      winCombos = [[0,1,2],[3,4,5],[6,7,8],[0,4,8],[6,4,2],[2,5,8],[1,4,7],[0,3,6]];

let gameBoard, user = 'X', computer = 'O', difficulty = 'hard'; // default

// User selects X or O
const playerSelect = player => {
  user = player;
  computer = player === 'X' ? 'O' : 'X';
  gameBoard = [...Array(9).keys()];
  cells.forEach(cell => cell.addEventListener('click', handleClick, false));
  if (computer === 'X') turn(bestSpot(), computer);
  fade(selection, 'out');
  fade(playBoard, 'in');
};

// Initialize game
const startGame = () => {
  fade(winner, 'out');
  fade(playBoard, 'out');
  fade(selection, 'out');
  fade(difficultyBox, 'in');

  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.style.color = '#000';
    cell.style.background = '#ff9eb150';
  });
};

// On cell click
const handleClick = e => {
  const id = e.target.id;
  if (typeof gameBoard[id] === 'number') {
    turn(id, user);
    if (!checkWin(gameBoard, user) && !checkTie()) {
      setTimeout(() => turn(bestSpot(), computer), 500);
    }
  }
};

// Place mark and check win/tie
const turn = (id, player) => {
  gameBoard[id] = player;
  getById(id).innerHTML = player;
  let win = checkWin(gameBoard, player);
  if (win) gameOver(win);
  checkTie();
};

// Check for win
const checkWin = (board, player) => {
  let plays = board.reduce((a, e, i) => e === player ? a.concat(i) : a, []);
  for (let [i, combo] of winCombos.entries()) {
    if (combo.every(idx => plays.includes(idx)))
      return { index: i, player };
  }
  return null;
};

// End game and highlight winner
const gameOver = win => {
  winCombos[win.index].forEach(i => {
    const cell = getById(i);
    cell.style.color = '#FFF';
    cell.style.backgroundColor = '#B33951';
  });
  cells.forEach(c => c.removeEventListener('click', handleClick));
  declareWinner(win.player === user ? "You Won The Game!" : "Computer Won The Game!");
};

// Show result
const declareWinner = msg => {
  winner.querySelector('h3').innerHTML = msg;
  setTimeout(() => {
    fade(playBoard, 'out');
    fade(winner, 'in');
  }, 1500);
};

// Get empty spots
const emptySquares = board => board.filter((e, i) => i === e);

// Check for tie
const checkTie = () => {
  if (emptySquares(gameBoard).length === 0) {
    cells.forEach(c => {
      c.style.backgroundColor = "#B33951";
      c.removeEventListener('click', handleClick);
    });
    declareWinner("The Game Is Tie!");
    return true;
  }
  return false;
};

// Best move based on difficulty
const bestSpot = () => {
  let available = emptySquares(gameBoard);
  if (difficulty === 'easy') {
    return available[Math.floor(Math.random() * available.length)];
  }
  if (difficulty === 'medium' && Math.random() < 0.5) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return minMax(gameBoard, computer).index;
};

// Minimax algorithm
const minMax = (board, player) => {
  let opens = emptySquares(board);
  if (checkWin(board, user)) return { score: -10 };
  if (checkWin(board, computer)) return { score: 10 };
  if (opens.length === 0) return { score: 0 };

  let moves = [];
  for (let i = 0; i < opens.length; i++) {
    let move = { index: board[opens[i]] };
    board[opens[i]] = player;
    move.score = player === computer
      ? minMax(board, user).score
      : minMax(board, computer).score;
    board[opens[i]] = move.index;
    moves.push(move);
  }

  return moves.reduce((best, m) => {
    return (player === computer)
      ? (m.score > best.score ? m : best)
      : (m.score < best.score ? m : best);
  });
};

// Starry animated background
const canvas = getById('stars'),
      ctx = canvas.getContext('2d'),
      stars = [],
      numStars = 100;

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.5 + 0.2
  });
}

const animateStars = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
  requestAnimationFrame(animateStars);
};
animateStars();

// Set difficulty
$$('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    difficulty = btn.dataset.level;
    fade(difficultyBox, 'out');
    fade(selection, 'in');
  });
});

// Start with difficulty screen
fade(selection, 'out');
fade(playBoard, 'out');
fade(winner, 'out');
fade(difficultyBox, 'in');
