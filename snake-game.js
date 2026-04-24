export class SnakeGame {
  constructor(outputDiv, scrollFn, onExit) {
    this.outputDiv = outputDiv;
    this.scroll = scrollFn;
    this.onExit = onExit;

    this.cols = 0;
    this.rows = 0;
    this.cell = 0;

    this.snake = [];
    this.dir = { x: 1, y: 0 };
    this.next = { x: 1, y: 0 };
    this.food = null;
    this.score = 0;
    this.running = false;
    this.timer = null;

    this._keyHandler = this._onKey.bind(this);
    this._touchStartHandler = this._onTouchStart.bind(this);
    this._touchEndHandler = this._onTouchEnd.bind(this);
    this._touchStartX = 0;
    this._touchStartY = 0;
  }

  _calcDimensions() {
    const availWidth = Math.min(
      this.outputDiv.clientWidth || window.innerWidth,
      window.innerWidth - 16,
    );
    this.cell = availWidth < 400 ? 12 : 16;
    this.cols = Math.min(40, Math.floor(availWidth / this.cell));
    this.rows = Math.min(25, Math.max(15, Math.floor(this.cols * 0.6)));
  }

  start() {
    this._calcDimensions();

    const wrapper = document.createElement('div');
    wrapper.className = 'output-line';
    this._wrapper = wrapper;

    this._info = document.createElement('div');
    this._info.textContent = 'Arrow keys / swipe: move';
    wrapper.appendChild(this._info);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.cols * this.cell;
    this.canvas.height = this.rows * this.cell;
    this.canvas.style.cssText = 'display:block;border:1px solid #33ff00;margin:6px 0;max-width:100%;';
    wrapper.appendChild(this.canvas);

    this._scoreEl = document.createElement('div');
    this._scoreEl.textContent = 'Score: 0';
    wrapper.appendChild(this._scoreEl);

    this.outputDiv.appendChild(wrapper);
    this.scroll();

    this.ctx = this.canvas.getContext('2d');
    this._reset();

    document.addEventListener('keydown', this._keyHandler);
    document.addEventListener('touchstart', this._touchStartHandler, { passive: true });
    document.addEventListener('touchend', this._touchEndHandler, { passive: true });
    this.timer = setInterval(() => this._tick(), 150);
  }

  _onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
  }

  _onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - this._touchStartX;
    const dy = e.changedTouches[0].clientY - this._touchStartY;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    let d;
    if (Math.abs(dx) >= Math.abs(dy)) {
      d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    if (d.x !== -this.dir.x || d.y !== -this.dir.y) this.next = d;
  }

  _removeTouchListeners() {
    document.removeEventListener('touchstart', this._touchStartHandler);
    document.removeEventListener('touchend', this._touchEndHandler);
  }

  _reset() {
    const midY = Math.floor(this.rows / 2);
    this.snake = [
      { x: 5, y: midY },
      { x: 4, y: midY },
      { x: 3, y: midY },
    ];
    this.dir = { x: 1, y: 0 };
    this.next = { x: 1, y: 0 };
    this.score = 0;
    this.running = true;
    this._placeFood();
    this._draw();
  }

  _placeFood() {
    const occupied = new Set(this.snake.map(s => `${s.x},${s.y}`));
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
    } while (occupied.has(`${pos.x},${pos.y}`));
    this.food = pos;
  }

  _onKey(e) {
    const dirs = {
      ArrowUp:    { x: 0,  y: -1 },
      ArrowDown:  { x: 0,  y:  1 },
      ArrowLeft:  { x: -1, y:  0 },
      ArrowRight: { x: 1,  y:  0 },
    };
    if (dirs[e.key]) {
      const d = dirs[e.key];
      if (d.x !== -this.dir.x || d.y !== -this.dir.y) this.next = d;
      e.preventDefault();
    }
  }

  _tick() {
    if (!this.running) return;

    this.dir = this.next;
    const head = {
      x: this.snake[0].x + this.dir.x,
      y: this.snake[0].y + this.dir.y,
    };

    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this._gameOver();
      return;
    }

    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this._gameOver();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this._scoreEl.textContent = `Score: ${this.score}`;
      this._placeFood();
    } else {
      this.snake.pop();
    }

    this._draw();
  }

  _draw() {
    const { ctx, cols, rows, cell } = this;

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, cols * cell, rows * cell);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, rows * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(cols * cell, y * cell);
      ctx.stroke();
    }

    this.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#33ff00' : '#1a8c00';
      ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
    });

    ctx.fillStyle = '#ff3300';
    ctx.fillRect(this.food.x * cell + 2, this.food.y * cell + 2, cell - 4, cell - 4);
  }

  _gameOver() {
    this.running = false;
    clearInterval(this.timer);
    document.removeEventListener('keydown', this._keyHandler);
    this._removeTouchListeners();

    const { ctx, cols, rows, cell } = this;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, cols * cell, rows * cell);
    ctx.fillStyle = '#33ff00';
    ctx.textAlign = 'center';
    ctx.font = `bold ${cell * 1.5}px monospace`;
    ctx.fillText('GAME OVER', (cols * cell) / 2, (rows * cell) / 2 - cell);
    ctx.font = `${cell}px monospace`;
    ctx.fillText(`Score: ${this.score}`, (cols * cell) / 2, (rows * cell) / 2 + cell);

    this._info.textContent = `Game over! Score: ${this.score}`;
    this.onExit();
  }
}
