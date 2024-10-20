import Draggable from './components/draggable.js';
import Grid from './components/grid.js';

const canvas = document.getElementById('grid');
const draggableEl = document.querySelector('.draggable');
const selectPathVisualCheckbox = document.getElementById('path-visual');
const allowDiagonalCheckbox = document.getElementById('allow-diagonal');
const clearWallsBtn = document.getElementById('clear-walls');
const drawPathBtn = document.getElementById('draw-path');
const redrawPathAutomaticallyCheckbox = document.getElementById(
  'redraw-path-automatically'
);

// Init grid
const grid = new Grid(canvas, window.innerWidth, window.innerHeight, 30);
// Init draggable
new Draggable(draggableEl, 8, 8);

clearWallsBtn.addEventListener('click', () => {
  grid.clearWalls();
});

drawPathBtn.addEventListener('click', () => {
  grid.refreshGrid();
});

allowDiagonalCheckbox.addEventListener('change', () => {
  grid.allowDiagonal(allowDiagonalCheckbox.checked);
});

redrawPathAutomaticallyCheckbox.addEventListener('change', () => {
  drawPathBtn.style.display = redrawPathAutomaticallyCheckbox.checked
    ? 'none'
    : 'block';
  grid.redrawPathAutomatically(redrawPathAutomaticallyCheckbox.checked);
});

selectPathVisualCheckbox.addEventListener('change', () => {
  grid.setPathStyle(
    selectPathVisualCheckbox.options[selectPathVisualCheckbox.selectedIndex]
      .value
  );
});

// Let cursor draw under draggable el
canvas.addEventListener('mousedown', () => {
  draggableEl.style.pointerEvents = 'none';
});
canvas.addEventListener('mouseup', () => {
  draggableEl.style.pointerEvents = 'auto';
});
