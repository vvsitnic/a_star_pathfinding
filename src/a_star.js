function calcH(x1, x2, y1, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export default function a_star(
  start,
  finish,
  gridWidth,
  gridHeight,
  lockedTiles = [],
  allowDiagonal = false
) {
  const openList = [];
  const closedList = [];

  // Add first node to the openList
  const hStart = calcH(start[0], finish[0], start[1], finish[1]);
  openList.push({
    pos: start,
    parent: null,
    h: hStart,
    g: 0,
    f: hStart,
  });

  while (openList.length > 0) {
    // Find lowest F node
    let currentNode = openList[0];
    let currentNodeIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (currentNode.f > openList[i].f) {
        currentNode = openList[i];
        currentNodeIndex = i;
      }
    }

    // Check if this node is finish
    if (currentNode.pos[0] === finish[0] && currentNode.pos[1] === finish[1]) {
      // Generate path
      const path = [];
      let current = currentNode;
      while (current) {
        path.push(current.pos);
        current = current.parent;
      }
      return path;
    }

    // Mark node as checked
    closedList.push(currentNode);
    openList.splice(currentNodeIndex, 1);

    let childrenRelativePos = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    if (allowDiagonal) {
      childrenRelativePos = [
        ...childrenRelativePos,
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];
    }

    // Check every neighbour of current node
    for (const childRelativePos of childrenRelativePos) {
      const nodeX = currentNode.pos[0] + childRelativePos[0];
      const nodeY = currentNode.pos[1] + childRelativePos[1];

      if (
        nodeX < 0 ||
        nodeX > gridWidth - 1 ||
        nodeY < 0 ||
        nodeY > gridHeight - 1 ||
        lockedTiles.some(tile => tile[0] === nodeX && tile[1] === nodeY)
      ) {
        continue;
      }

      // Check for diagonal walls if necessary
      if (allowDiagonal) {
        if (
          lockedTiles.some(
            tile => tile[0] === nodeX && tile[1] === currentNode.pos[1]
          ) &&
          lockedTiles.some(
            tile => tile[0] === currentNode.pos[0] && tile[1] === nodeY
          )
        ) {
          continue;
        }
      }

      // Skip if node has already been checked
      if (
        closedList.some(node => node.pos[0] === nodeX && node.pos[1] === nodeY)
      ) {
        continue;
      }

      // Create new node
      const newNode = {
        pos: [nodeX, nodeY],
        parent: currentNode,
      };
      // Calc g, h, f variables of the new node
      const delta =
        childRelativePos[0] === 0 || childRelativePos[1] === 0 ? 1 : 1.4; // returns 1.4 if diagonal movement is allowed
      const gScore = currentNode.g + delta;
      newNode.g = gScore;
      newNode.h = calcH(newNode.pos[0], finish[0], newNode.pos[1], finish[1]);
      newNode.f = newNode.g + newNode.h;

      const openSetNodeIndex = openList.findIndex(
        node => node.pos[0] === newNode.pos[0] && node.pos[1] === newNode.pos[1]
      );
      // If node exists in the open list, overwrite it
      // Else add it to the open list
      if (openSetNodeIndex === -1) {
        openList.push(newNode);
      } else if (gScore < openList[openSetNodeIndex].g) {
        openList[openSetNodeIndex].g = newNode.g;
        openList[openSetNodeIndex].f = newNode.f;
        openList[openSetNodeIndex].parent = currentNode;
      }
    }
  }
}
