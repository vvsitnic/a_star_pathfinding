import a_star from "../a_star.js";

class Grid {
  _canvas;
  _ctx;
  _tileSize; // In px

  _gridSize = [20, 20]; // In tiles
  _grid;
  _point1 = [0, 0]; // Start point
  _point2 = [0, 1]; // End point
  _draggablePoint = null;
  _lastSelectedTile = null; // 0 - no, 1 - wall or Array(point)

  _prevTile = null; // Is recorded only when cursor is interacting with the grid

  _path = [];
  _allowDiagonal = true;
  _redrawPathAutomatically = true;
  _pathStyle = "tiles";

  _gridWidth;
  _gridHeight;

  constructor(canvasElement, canvasWidth, canvasHeight, tileSize) {
    if (!canvasElement) throw new Error("canvasElement not provided!");
    if (!canvasWidth || !canvasHeight)
      throw new Error("canvas dimentions not provided!");
    if (!tileSize) throw new Error("tile size not provided!");

    // Configure grid and canvas size
    this._gridWidth = Math.floor(canvasWidth / tileSize);
    this._gridHeight = Math.floor(canvasHeight / tileSize);
    canvasElement.width = this._gridWidth * tileSize;
    canvasElement.height = this._gridHeight * tileSize;

    this._tileSize = tileSize;
    this._gridSize = [this._gridWidth, this._gridHeight];
    this._canvas = canvasElement;
    this._ctx = canvasElement.getContext("2d");
    this._grid = Array.from({ length: this._gridWidth }, () =>
      Array(this._gridHeight).fill(0)
    );

    // Configure position of start and finish points
    this._point1 = [
      Math.floor(this._gridWidth / 2) - Math.floor(this._gridWidth / 4),
      Math.floor(this._gridHeight / 2),
    ];
    this._point2 = [
      Math.floor(this._gridWidth / 2) + Math.floor(this._gridWidth / 4),
      Math.floor(this._gridHeight / 2),
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
    this._canvas.addEventListener("mousedown", this._onMouseDown.bind(this));

    // On mouse up
    this._canvas.addEventListener("mouseup", this._onMouseUp.bind(this));

    // On mouse move
    this._canvas.addEventListener("mousemove", this._onMouseMove.bind(this));
  }

  _onMouseDown(e) {
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
    // const lockedTileIndex = this._walls.findIndex(
    // (wall) => wall[0] === tileX && wall[1] === tileY
    // );
    if (tile === 1) {
      // Delete wall
      // this._walls.splice(lockedTileIndex, 1);
      this._grid[tileX][tileY] = 0;
    }
    if (tile === 0) {
      // Add wall
      // this._walls.push([tileX, tileY]);
      this._grid[tileX][tileY] = 1;
    }

    this._lastSelectedTile = tile;

    // Rethink path
    if (this._redrawPathAutomatically) {
      this._aStar();
    }
    // Redraw grid
    this._refreshGrid();
  }

  _onMouseUp() {
    // Deselect everything that could be selected
    this._lastSelectedTile = null;
    this._draggablePoint = null;
    this._prevTile = null;
  }

  _onMouseMove(e) {
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
    // !this._walls.some((wall) => wall[0] === tileX && wall[1] === tileY)
    if (this._draggablePoint !== null) {
      if (this._grid[tileX][tileY] === 0) {
        this._draggablePoint[0] = tileX;
        this._draggablePoint[1] = tileY;

        if (this._redrawPathAutomatically) {
          // Rethink path
          this._aStar();
        }

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
    // const lockedTileIndex = this._walls.findIndex(
    //   (wall) => wall[0] === tileX && wall[1] === tileY
    // );
    // If lastSelectedTile was empty => draw walls
    this._grid[tileX][tileY] = this._lastSelectedTile === 1 ? 0 : 1;

    // Update prev tile
    this._prevTile = [tileX, tileY];
    if (this._redrawPathAutomatically) {
      // Rethink path
      this._aStar();
    }
    this._refreshGrid();
  }

  _getMouseOnGrid(mouseX, mouseY) {
    const gridX = Math.floor(mouseX / this._tileSize);
    const gridY = Math.floor(mouseY / this._tileSize);
    return [gridX, gridY];
  }

  _getTile(gridX, gridY) {
    // Retun point
    if (gridX === this._point1[0] && gridY === this._point1[1])
      return this._point1;
    if (gridX === this._point2[0] && gridY === this._point2[1])
      return this._point2;

    // Return 0 - no wall / 1 - wall
    // const tile = this._walls.some(
    //   (wall) => wall[0] === gridX && wall[1] === gridY
    // )
    //   ? 1
    //   : 0;
    return this._grid[gridX][gridY];
  }

  _aStar() {
    this._path = a_star(
      [...this._point1],
      [...this._point2],
      this._grid,
      this._allowDiagonal
    );
  }

  _refreshGrid() {
    const tileSize = this._tileSize;
    // Clear canvas
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Draw grid
    this._ctx.strokeStyle = "#ccc";
    this._ctx.lineWidth = 1;
    for (let x = 0; x < this._canvas.width; x += tileSize) {
      for (let y = 0; y < this._canvas.height; y += tileSize) {
        this._ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Draw walls
    // this._walls.forEach((tile) => {
    //   this._drawSquare(tile[0], tile[1], "#00000080");
    // });
    for (let x = 0; x < this._gridWidth; x++) {
      for (let y = 0; y < this._gridHeight; y++) {
        if (this._grid[x][y] === 1) {
          this._drawSquare(x, y, "#00000080");
        }
      }
    }

    this._drawPath();

    // Draw start and end points
    this._drawSquare(this._point1[0], this._point1[1], "#00DD00");
    this._drawSquare(this._point2[0], this._point2[1], "#EE4400");
  }

  _drawPath() {
    const path = this._path;

    if (path && this._pathStyle === "tiles") {
      path.forEach((point) => {
        this._drawSquare(point[0], point[1], "#0066FF");
      });
    }

    if (path && this._pathStyle === "line") {
      for (let i = 0; i < path.length - 1; i++) {
        this._drawLine(path[i], path[i + 1], "#0066FF", 12);
      }
    }
  }

  _drawSquare(gridX, gridY, color = "#fff") {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(
      gridX * this._tileSize,
      gridY * this._tileSize,
      this._tileSize,
      this._tileSize
    );
  }

  _drawLine(point1, point2, color = "#fff", lineWidth = 5) {
    const tileSize = this._tileSize;
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = lineWidth;
    this._ctx.lineJoin = "round";
    this._ctx.lineCap = "round";
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

  clearWalls() {
    for (let x = 0; x < this._gridWidth; x++) {
      for (let y = 0; y < this._gridHeight; y++) {
        this._grid[x][y] = 0;
      }
    }

    if (this._redrawPathAutomatically) {
      this._aStar();
    }
    this._refreshGrid();
  }

  allowDiagonal(b) {
    this._allowDiagonal = b;

    if (this._redrawPathAutomatically) {
      this._aStar();
    }
    this._refreshGrid();
  }

  redrawPathAutomatically(b) {
    this._redrawPathAutomatically = b;
    if (b) {
      this._aStar();
      this._refreshGrid();
    }
  }

  setPathStyle(style) {
    this._pathStyle = style;
    this._refreshGrid();
  }

  drawPath() {
    this._aStar();
    this._refreshGrid();
  }
}

export default Grid;
