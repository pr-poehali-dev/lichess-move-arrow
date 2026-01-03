let arrows = [];
let currentColor = '#22c55e';
let dragStart = null;
let isDrawing = false;
let canvas = null;
let controlPanel = null;

const colors = {
  green: '#22c55e',
  red: '#ef4444',
  blue: '#0ea5e9',
  orange: '#f97316'
};

function init() {
  const board = document.querySelector('cg-board');
  if (!board) {
    setTimeout(init, 500);
    return;
  }

  createCanvas(board);
  createControlPanel();
  attachEventListeners(board);
  
  console.log('Lichess Arrow Tool активирован!');
}

function createCanvas(board) {
  if (canvas) return;
  
  canvas = document.createElement('canvas');
  canvas.id = 'lichess-arrow-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '10';
  
  const container = board.parentElement;
  container.style.position = 'relative';
  container.appendChild(canvas);
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  const board = document.querySelector('cg-board');
  if (!board) return;
  
  const rect = board.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redrawArrows();
}

function createControlPanel() {
  if (controlPanel) return;
  
  controlPanel = document.createElement('div');
  controlPanel.id = 'lichess-arrow-panel';
  controlPanel.innerHTML = `
    <style>
      #lichess-arrow-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #1a1f2c;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        font-family: 'Roboto', sans-serif;
        min-width: 200px;
      }
      #lichess-arrow-panel h3 {
        margin: 0 0 12px 0;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .arrow-color-btn {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        margin: 4px;
        transition: all 0.2s;
      }
      .arrow-color-btn:hover {
        transform: scale(1.1);
        border-color: #fff;
      }
      .arrow-color-btn.active {
        border-color: #9b87f5;
        box-shadow: 0 0 0 3px rgba(155, 135, 245, 0.3);
      }
      .arrow-control-btn {
        width: 100%;
        padding: 8px 12px;
        margin: 6px 0;
        border-radius: 8px;
        border: none;
        background: #2d3548;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .arrow-control-btn:hover {
        background: #3d4558;
      }
      .arrow-control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .arrow-count {
        color: #8e9196;
        font-size: 12px;
        margin: 8px 0;
      }
      .arrow-count span {
        color: #9b87f5;
        font-weight: 600;
      }
      .color-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }
    </style>
    <h3>🎯 Стрелки</h3>
    <div class="color-grid">
      <button class="arrow-color-btn active" data-color="green" style="background: #22c55e;"></button>
      <button class="arrow-color-btn" data-color="red" style="background: #ef4444;"></button>
      <button class="arrow-color-btn" data-color="blue" style="background: #0ea5e9;"></button>
      <button class="arrow-color-btn" data-color="orange" style="background: #f97316;"></button>
    </div>
    <div class="arrow-count">Стрелок: <span id="arrow-count">0</span></div>
    <button class="arrow-control-btn" id="clear-arrows">Очистить</button>
    <button class="arrow-control-btn" id="export-arrows">Экспорт</button>
  `;
  
  document.body.appendChild(controlPanel);
  
  document.querySelectorAll('.arrow-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.arrow-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = colors[btn.dataset.color];
    });
  });
  
  document.getElementById('clear-arrows').addEventListener('click', clearArrows);
  document.getElementById('export-arrows').addEventListener('click', exportArrows);
}

function attachEventListeners(board) {
  board.addEventListener('mousedown', handleMouseDown);
  board.addEventListener('mouseup', handleMouseUp);
  board.addEventListener('mouseleave', handleMouseLeave);
}

function handleMouseDown(e) {
  const square = getSquareFromPoint(e.clientX, e.clientY);
  if (square) {
    dragStart = square;
    isDrawing = true;
  }
}

function handleMouseUp(e) {
  if (!isDrawing || !dragStart) return;
  
  const square = getSquareFromPoint(e.clientX, e.clientY);
  if (square && square !== dragStart) {
    arrows.push({ from: dragStart, to: square, color: currentColor });
    redrawArrows();
    updateArrowCount();
  }
  
  dragStart = null;
  isDrawing = false;
}

function handleMouseLeave() {
  dragStart = null;
  isDrawing = false;
}

function getSquareFromPoint(clientX, clientY) {
  const board = document.querySelector('cg-board');
  if (!board) return null;
  
  const rect = board.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;
  
  const squareSize = rect.width / 8;
  const file = Math.floor(x / squareSize);
  const rank = Math.floor(y / squareSize);
  
  const isFlipped = board.classList.contains('orientation-black');
  
  const files = 'abcdefgh';
  const ranks = '87654321';
  
  if (isFlipped) {
    return files[7 - file] + ranks[7 - rank];
  } else {
    return files[file] + ranks[rank];
  }
}

function getSquareCoordinates(square) {
  const board = document.querySelector('cg-board');
  if (!board) return null;
  
  const files = 'abcdefgh';
  const ranks = '87654321';
  
  const file = files.indexOf(square[0]);
  const rank = ranks.indexOf(square[1]);
  
  const rect = board.getBoundingClientRect();
  const squareSize = rect.width / 8;
  
  const isFlipped = board.classList.contains('orientation-black');
  
  let x, y;
  if (isFlipped) {
    x = (7 - file + 0.5) * squareSize;
    y = (7 - rank + 0.5) * squareSize;
  } else {
    x = (file + 0.5) * squareSize;
    y = (rank + 0.5) * squareSize;
  }
  
  return { x, y };
}

function drawArrow(ctx, from, to, color) {
  const fromCoords = getSquareCoordinates(from);
  const toCoords = getSquareCoordinates(to);
  
  if (!fromCoords || !toCoords) return;
  
  const headlen = 15;
  const dx = toCoords.x - fromCoords.x;
  const dy = toCoords.y - fromCoords.y;
  const angle = Math.atan2(dy, dx);
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.8;
  
  ctx.beginPath();
  ctx.moveTo(fromCoords.x, fromCoords.y);
  ctx.lineTo(toCoords.x, toCoords.y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(toCoords.x, toCoords.y);
  ctx.lineTo(
    toCoords.x - headlen * Math.cos(angle - Math.PI / 6),
    toCoords.y - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toCoords.x - headlen * Math.cos(angle + Math.PI / 6),
    toCoords.y - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  
  ctx.globalAlpha = 1;
}

function redrawArrows() {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  arrows.forEach(arrow => {
    drawArrow(ctx, arrow.from, arrow.to, arrow.color);
  });
}

function clearArrows() {
  arrows = [];
  redrawArrows();
  updateArrowCount();
}

function updateArrowCount() {
  const countEl = document.getElementById('arrow-count');
  if (countEl) {
    countEl.textContent = arrows.length;
  }
}

function exportArrows() {
  const exportData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    arrows: arrows
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lichess-arrows-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
