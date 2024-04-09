// Constants
const canvas = document.getElementById("fractal-canvas");
const resetBtn = document.getElementById("reset-btn");
const colorBtn = document.getElementById("color-btn");

// Fractal parameters
let width = (canvas.width = 800);
let height = (canvas.height = 600);
let maxIterations = 100;
let zoom = 1;
let panX = 0;
let panY = 0;
let colorMode = 0;

// Get the 2D rendering context
const ctx = canvas.getContext("2d");

// Mandelbrot calculation function
function mandelbrot(x, y) {
  let a = (x - width / 2) / (0.5 * zoom * width) + panX;
  let b = (y - height / 2) / (0.5 * zoom * height) + panY;
  let a2 = a * a;
  let b2 = b * b;
  let n = 0;
  while (a2 + b2 < 4 && n < maxIterations) {
    let temp = a2 - b2 + x;
    b = 2 * a * b + y;
    a = temp;
    a2 = a * a;
    b2 = b * b;
    n++;
  }
  return n;
}

// Render the fractal
function renderFractal() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let iterations = mandelbrot(x, y);
      let color;
      switch (colorMode) {
        case 0:
          color = `hsl(${iterations * 2}, 100%, 50%)`;
          break;
        case 1:
          color = `rgb(${iterations * 2}, ${255 - iterations * 2}, 0)`;
          break;
        case 2:
          color = `rgb(${255 - iterations * 2}, ${iterations * 2}, ${iterations * 2})`;
          break;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

// Handle zooming and panning
let isDragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    panX -= (e.offsetX - lastX) / (0.5 * zoom * width);
    panY -= (e.offsetY - lastY) / (0.5 * zoom * height);
    lastX = e.offsetX;
    lastY = e.offsetY;
    renderFractal();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoom *= e.deltaY < 0 ? 1.1 : 0.9;
  renderFractal();
});

// Handle button clicks
resetBtn.addEventListener("click", () => {
  zoom = 1;
  panX = 0;
  panY = 0;
  renderFractal();
});

colorBtn.addEventListener("click", () => {
  colorMode = (colorMode + 1) % 3;
  renderFractal();
});

// Initial render
renderFractal();
