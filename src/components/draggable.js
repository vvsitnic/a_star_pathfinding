class Draggable {
  _el;
  _draggable;
  _dragOffset;

  constructor(htmlElement, x = 0, y = 0) {
    if (!htmlElement) throw new Error('No html element provided!');

    htmlElement.classList.add('draggable');
    this._el = htmlElement;
    this._setPos(x, y);

    this._handleEvents();
  }

  _handleEvents() {
    this._el.addEventListener('mousedown', e => {
      if (
        ['LABEL', 'INPUT', 'BUTTON', 'A', 'SELECT'].includes(e.target.tagName)
      ) {
        return;
      }

      this._onMouseDown(e);
    });
    document.addEventListener('mouseup', () => {
      this._draggable = false;
    });
    document.addEventListener('mousemove', e => {
      if (!this._draggable) return;

      this.onDrag(e);
    });
  }

  // Set pos of the element
  _setPos(x, y) {
    if (x !== null) this._el.style.left = `${x}px`;
    if (y !== null) this._el.style.top = `${y}px`;
  }

  // Get postion of the element
  _getPos() {
    return [
      +this._el.style.left.slice(0, -2),
      +this._el.style.top.slice(0, -2),
    ];
  }

  _onMouseDown(e) {
    // Set mouse offset
    const [elX, elY] = this._getPos();
    this._dragOffset = [elX - e.clientX, elY - e.clientY];

    this._draggable = true;
  }

  onDrag(e) {
    this._setPos(
      e.clientX + this._dragOffset[0],
      e.clientY + this._dragOffset[1]
    );
  }
}

export default Draggable;
