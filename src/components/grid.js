import a_star from '../a_star.js';

class Grid {
  _canvas;
  _ctx;
  _tileSize; // In px

  _gridSize = [20, 20]; // In tiles
  _walls = [];
  _point1 = [0, 0]; // Start point
  _point2 = [0, 1]; // End point
  _draggablePoint = null;
  _lastSelectedTile = null; // 0 - no, 1 - wall or Array(point)

  _prevTile = null; // Is recorded only when cursor is interacting with the grid

  _path = [];
  _allowDiagonal = true;
  _redrawPathAutomatically = true;
  _pathStyle = 'tiles';

  constructor(canvasElement, canvasWidth, canvasHeight, tileSize) {
    if (!canvasElement) throw new Error('canvasElement not provided!');
    if (!canvasWidth || !canvasHeight)
      throw new Error('canvas dimentions not provided!');
    if (!tileSize) throw new Error('tile size not provided!');

    // Configure grid and canvas size
    const gridWidth = Math.floor(canvasWidth / tileSize);
    const gridHeight = Math.floor(canvasHeight / tileSize);
    canvasElement.width = gridWidth * tileSize;
    canvasElement.height = gridHeight * tileSize;

    this._tileSize = tileSize;
    this._gridSize = [gridWidth, gridHeight];
    this._canvas = canvasElement;
    this._ctx = canvasElement.getContext('2d');

    // Configure position of start and finish points
    this._point1 = [
      Math.floor(gridWidth / 2) - Math.floor(gridWidth / 4),
      Math.floor(gridHeight / 2),
    ];
    this._point2 = [
      Math.floor(gridWidth / 2) + Math.floor(gridWidth / 4),
      Math.floor(gridHeight / 2),
    ];

    // Createpath
    this._aStar();
    // Draw grid
    this._refreshGrid();
    // Handle grid events
    this._handleEvents();
  }

  _handleEvents() {
    // On mouse down
    this._canvas.addEventListener('mousedown', e => {
      const [tileX, tileY] = this._getMouseOnGrid(e.clientX, e.clientY);
      this._prevTile = [tileX, tileY];
      // Record which tile was clicked
      const tile = this._getTile(tileX, tileY);
      // Check if it is a point
      if (Array.isArray(tile)) {
        this._draggablePoint = tile;
        return;
      }

      // Check if tile is a wall or empty
      const lockedTileIndex = this._walls.findIndex(
        wall => wall[0] === tileX && wall[1] === tileY
      );
      if (tile === 1) {
        // Delete wall
        this._walls.splice(lockedTileIndex, 1);
      }
      if (tile === 0) {
        // Add wall
        this._walls.push([tileX, tileY]);
      }

      this._lastSelectedTile = tile;

      // Rethink path
      this._aStar();
      // Redraw grid
      this._refreshGrid();
    });

    // On mouse up
    this._canvas.addEventListener('mouseup', () => {
      // Deselect everything that could be selected
      this._lastSelectedTile = null;
      this._draggablePoint = null;
      this._prevTile = null;
    });

    // On mouse move
    this._canvas.addEventListener('mousemove', e => {
      // Check if cursor is interacting (holding point / drawing/deleting walls)
      if (this._lastSelectedTile === null && this._draggablePoint === null)
        return;

      const [tileX, tileY] = this._getMouseOnGrid(e.clientX, e.clientY);

      // Return if tile didn't change
      if (
        !Array.isArray(this._prevTile) ||
        (tileX === this._prevTile[0] && tileY === this._prevTile[1])
      )
        return;

      // If holding a point, change it's position
      // Point pos will not change if current tile is a wall
      if (this._draggablePoint !== null) {
        if (!this._walls.some(wall => wall[0] === tileX && wall[1] === tileY)) {
          this._draggablePoint[0] = tileX;
          this._draggablePoint[1] = tileY;

          // Rethink path
          this._aStar();

          this._refreshGrid();
        }

        // Update prev tile
        this._prevTile = [tileX, tileY];
        return;
      }

      // If cursor is not holding a point and event fired => lastSelectedTile exists => Attempt to draw if tile isn't a point
      const posOverlapsPoints =
        (tileX === this._point1[0] && tileY === this._point1[1]) ||
        (tileX === this._point2[0] && tileY === this._point2[1]);

      if (posOverlapsPoints) return;

      // Check if tile is a wall or empty
      const lockedTileIndex = this._walls.findIndex(
        wall => wall[0] === tileX && wall[1] === tileY
      );
      // If lastSelectedTile was empty => draw walls
      if (this._lastSelectedTile === 1) {
        if (lockedTileIndex !== -1) {
          this._walls.splice(lockedTileIndex, 1);
        }
      }
      // If lastSelectedTile was a wall => earase walls
      if (this._lastSelectedTile === 0) {
        if (lockedTileIndex === -1) {
          this._walls.push([tileX, tileY]);
        }
      }

      // Update prev tile
      this._prevTile = [tileX, tileY];
      // Rethink path
      this._aStar();
      // Redraw grid
      this._refreshGrid();
    });
  }

  _aStar() {
    this._path = a_star(
      this._point1,
      this._point2,
      this._gridSize[0],
      this._gridSize[1],
      this._walls,
      this._allowDiagonal
    );
  }

  _getTile(gridX, gridY) {
    // Retun point
    if (gridX === this._point1[0] && gridY === this._point1[1])
      return this._point1;
    if (gridX === this._point2[0] && gridY === this._point2[1])
      return this._point2;

    // Return 0 - no wall / 1 - wall
    const tile = this._walls.some(
      wall => wall[0] === gridX && wall[1] === gridY
    )
      ? 1
      : 0;
    return tile;
  }

  _refreshGrid() {
    const tileSize = this._tileSize;
    // Clear canvas
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw grid
    this._ctx.strokeStyle = '#ccc';
    this._ctx.lineWidth = 1;
    for (let x = 0; x < this._canvas.width; x += tileSize) {
      for (let y = 0; y < this._canvas.height; y += tileSize) {
        this._ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Draw walls
    this._walls.forEach(tile => {
      this._drawSquare(tile[0], tile[1], '#00000080');
    });

    // Draw path conditionally
    if (this._redrawPathAutomatically) {
      this._drawPath();
    }

    // Draw start and end points
    this._drawSquare(this._point1[0], this._point1[1], '#00DD00');
    this._drawSquare(this._point2[0], this._point2[1], '#EE4400');
  }

  _drawSquare(gridX, gridY, color = '#fff') {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(
      gridX * this._tileSize,
      gridY * this._tileSize,
      this._tileSize,
      this._tileSize
    );
  }

  _drawLine(point1, point2, color = '#fff', lineWidth = 5) {
    const tileSize = this._tileSize;
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = lineWidth;
    this._ctx.lineJoin = 'round';
    this._ctx.lineCap = 'round';
    this._ctx.beginPath();
    this._ctx.moveTo(
      (point1[0] + 0.5) * tileSize,
      (point1[1] + 0.5) * tileSize
    );
    this._ctx.lineTo(
      (point2[0] + 0.5) * tileSize,
      (point2[1] + 0.5) * tileSize
    );
    this._ctx.stroke();
  }

  _getMouseOnGrid(mouseX, mouseY) {
    const gridX = Math.floor(mouseX / this._tileSize);
    const gridY = Math.floor(mouseY / this._tileSize);
    return [gridX, gridY];
  }

  clearWalls() {
    this._walls.splice(0, this._walls.length);
    this._aStar();
    this._refreshGrid();
  }

  allowDiagonal(b) {
    this._allowDiagonal = b;
    this._refreshGrid();
  }

  redrawPathAutomatically(b) {
    this._redrawPathAutomatically = b;
    if (b) {
      this._refreshGrid();
    }
  }

  _drawPath() {
    const path = this._path;

    if (path && this._pathStyle === 'tiles') {
      path.forEach(point => {
        this._drawSquare(point[0], point[1], '#0066FF');
      });
    }

    if (path && this._pathStyle === 'line') {
      for (let i = 0; i < path.length - 1; i++) {
        this._drawLine(path[i], path[i + 1], '#0066FF', 10);
      }
    }
  }

  setPathStyle(style) {
    this._pathStyle = style;
    this._refreshGrid();
  }

  refreshGrid() {
    this._refreshGrid();
  }
}

export default Grid;
