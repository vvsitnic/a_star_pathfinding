# A* Pathfinding Algorithm
This repository contails the code for the A* pathfinfing algorithm in JavaScript for finding the shortest path from point A to point B on a rectangular area.

![Alt Text](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ozMHhoNzZvaHJobXlyMWhsbDZwMnV6Z3M4Mm8yYzhmdzBibHAyayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/49YrhA9qPC8psgmVZe/giphy.gif)

You can try the live demo [here](https://vvs-astar-pathfinding.netlify.app/).

## Features
- draw/earase walls
- move start/end points
- visual settigs.

## How It Works
- **g** - path distance from the start node to the current node.
- **h** - heuristic estimate from the current node to the end node (in this case we use Manhattan distance).
- **f**: sum of `g` and `h` values (estimated lenght of the full path).
- **Open set**: Set of nodes that are being considered as possible paths.
- **Closed set**: Set of nodes that have already been checked.
  
### Algorithm Steps:
1. Add **starting point** to the open set and write down it's `g`, `h` and `f` values.
2. Select the node with the lowest `f` value from the **open set**, make it the current node, remove it from the open set, and add it to the closed set.
3. Check if **position of the current node** equals to the finish point and **reconstruct the path** by following the parent nodes backward from the destination to the start node.
4. **Find neighbours** of the current node.
5. For each neighboring node:
   - Calculate `g`, `h` and `f` values.
   - Set its **parent** to the current node (for path reconstruction).
7. **Check if the neighbor node is already in the open set**:
   - If it is, check if the `g` value of the current node is lower. If yes, update the node with the new `g`, `f` and parent.
   - If it's not in the open set, **add it**.
9. **Repeat steps 2-4** while the open set is not empty.
10. **Reconstruct the path** by following the parent nodes backward from the destination to the start node.
