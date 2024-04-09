const canvas = document.getElementById("fractal-canvas");
const resetBtn = document.getElementById("reset-btn");
const colorBtn = document.getElementById("color-btn");

let width = (canvas.width = 800);
let height = (canvas.height = 600);
let maxIterations = 100;
let zoom = 1;
let panX = 0;
let panY = 0;
let colorMode = 0;

const gl = canvas.getContext("webgl");

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform float u_width;
  uniform float u_height;
  uniform float u_zoom;
  uniform float u_panX;
  uniform float u_panY;
  uniform int u_maxIterations;
  uniform int u_colorMode;

  vec3 getColor(int iterations) {
    float t = float(iterations) / float(u_maxIterations);
    if (u_colorMode == 0) {
      return vec3(0.5 + 0.5 * cos(3.0 + t * 10.0));
    } else if (u_colorMode == 1) {
      return vec3(t, 1.0 - t, 0.0);
    } else {
      return vec3(1.0 - t, t, t);
    }
  }

  void main() {
    float x = (gl_FragCoord.x - u_width / 2.0) / (0.5 * u_zoom * u_width) + u_panX;
    float y = (gl_FragCoord.y - u_height / 2.0) / (0.5 * u_zoom * u_height) + u_panY;

    float zr = 0.0;
    float zi = 0.0;
    int iterations = 0;
    while (zr * zr + zi * zi < 4.0 && iterations < u_maxIterations) {
      float temp = zr * zr - zi * zi + x;
      zi = 2.0 * zr * zi + y;
      zr = temp;
      iterations++;
    }

    vec3 color = iterations == u_maxIterations ? vec3(0.0) : getColor(iterations);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const widthUniformLocation = gl.getUniformLocation(program, "u_width");
const heightUniformLocation = gl.getUniformLocation(program, "u_height");
const zoomUniformLocation = gl.getUniformLocation(program, "u_zoom");
const panXUniformLocation = gl.getUniformLocation(program, "u_panX");
const panYUniformLocation = gl.getUniformLocation(program, "u_panY");
const maxIterationsUniformLocation = gl.getUniformLocation(program, "u_maxIterations");
const colorModeUniformLocation = gl.getUniformLocation(program, "u_colorMode");

// Render the fractal
function renderFractal() {
  gl.uniform1f(widthUniformLocation, width);
  gl.uniform1f(heightUniformLocation, height);
  gl.uniform1f(zoomUniformLocation, zoom);
  gl.uniform1f(panXUniformLocation, panX);
  gl.uniform1f(panYUniformLocation, panY);
  gl.uniform1i(maxIterationsUniformLocation, maxIterations);
  gl.uniform1i(colorModeUniformLocation, colorMode);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
