var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


var img = document.getElementById("scream");

// const WIDTH = 700;
// const HEIGHT = 525;
const WIDTH = 500;
const HEIGHT = 500;


ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

/* ctx.fillStyle = "#FF0000";
ctx.fillRect(0,0,150,75); */

var imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
var data = imageData.data;

/* for (var i=0; i< data.length; i+=4) {
  var sum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
  var sum = 0.33 * data[i] + 0.33 * data[i+1] + 0.33 * data[i+2]
  data[i] = sum;
  data[i+1] = sum;
  data[i+2] = sum;
  if (sum < 40) {
    data[i+3] = 0;
  }
} */

// const kernel = [
//   [-1, 0, 1],
//   [-2, 0, 2],
//   [-1, 0, 1]
// ];
// const kernel = [
//   [-1, -2, -1],
//   [0, 0, 0],
//   [1, 2, 1]
// ];
const kernelBlur = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1]
];
const kernelGx = [
  [-2, 0, 2],
  [-4, 0, 4],
  [-2, 0, 2]
];
const kernelGy = [
  [-2, -4, -2],
  [0, 0, 0],
  [2, 4, 2]
];
const findSum = (mat) => mat.reduce((acc, curr) => acc + curr.reduce((a,c)=>a+c, 0), 0);
const kernelSums = [9, 1];

const matrix = [[]];
for (let i=0; i < data.length-2; i+=4) {
  const row = parseInt(i / (WIDTH * 4));
  const column = (i % (WIDTH * 4)) / 4;
  
  if (matrix.length <= row) {
    matrix.push([[]]);
  }
  
  var sum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
  matrix[row][column] = sum;
}

let matrixBlur = matrix.map(a=>[...a]);
let matrixGx = matrix.map(a=>[...a]);
let matrixGy = matrix.map(a=>[...a]);

const operations = [
  { from: matrix, to: matrixBlur, kernel: kernelBlur, sum: findSum(matrix) },
  { from: matrixBlur, to: matrixGx, kernel: kernelGx, sum: findSum(matrix) },
  { from: matrixBlur, to: matrixGy, kernel: kernelGy, sum: findSum(matrix) },
];


for (let operationIndex = 0; operationIndex < operations.length; operationIndex++) {
  const operation = operations[operationIndex];
  const matrixFrom = operation.from;
  const matrixTo = operation.to;
  const sumDiv = operation.sum;
  const kernel = operation.kernel;

  for (let row = 0; row < matrixFrom.length; row++) {
    for (let column = 0; column < matrixFrom[row].length; column++) {
    
      let sum = 0;

      if(column - 1 >= 0 && row - 1 >= 0) {
        sum += kernel[0][0] * matrixFrom[row-1][column-1];
      }
      if(row - 1 >= 0) {
        sum += kernel[0][1] * matrixFrom[row-1][column];
      }
      if(row - 1 >= 0 && column + 1 < matrixFrom[row-1].length) {
        sum += kernel[0][2] * matrixFrom[row-1][column+1];
      }
      if(column - 1 >= 0) {
        sum += kernel[1][0] * matrixFrom[row][column-1];
      }
      
      sum += kernel[1][1] * matrixFrom[row][column];
      
      if(column + 1 < matrixFrom[row].length) {
        sum += kernel[1][2] * matrixFrom[row][column+1];
      }
      if(column - 1 >= 0 && row + 1 < matrixFrom.length) {
        sum += kernel[2][0] * matrixFrom[row+1][column-1];
      }
      if(row + 1 < matrixFrom.length) {
        sum += kernel[2][1] * matrixFrom[row+1][column];
      }
      if(row + 1 < matrixFrom.length && column + 1 < matrixFrom[row+1].length) {
        sum += kernel[2][2] * matrixFrom[row+1][column+1];
      }

      matrixTo[row][column] = sum / sumDiv;
    }
  }
  //matrixFrom = matrixTo.map(a=>[...a]);
}

let matrixG = matrix.map(a=>[...a]);
let matrixGradient = matrix.map(a=>[...a]);

// find G
for (let row = 0; row < matrixGy.length; row++) {
  for (let column = 0; column < matrixGy[row].length; column++) {
    matrixG[row][column] = Math.sqrt(matrixGx[row][column] * matrixGx[row][column] + matrixGy[row][column] * matrixGy[row][column]);
    
    let Gx = matrixGx[row][column];
    if (Gx === 0) Gx = 0.0001;
    let atan = Math.atan(matrixGy[row][column] / Gx) + Math.PI/2;
    if (atan < 0) atan = 0;
    //if (atan > Math.PI / 2) atan = Math.PI / 2;
    //logLimited(atan, );
    
    matrixGradient[row][column] = (atan) * 360 / Math.PI;
  }
}

for (let column = 0; column < matrixG[0].length; column++) {
  matrixG[0][column] = 0;
  matrixG[1][column] = 0;
  matrixG[matrixG.length-2][column] = 0;
  matrixG[matrixG.length-1][column] = 0;
}

for (let row = 0; row < matrixG.length; row++) {
  matrixG[row][0] = 0;
  matrixG[row][1] = 0;
  matrixG[row][matrixG[row].length-2] = 0;
  matrixG[row][matrixG[row].length-1] = 0;
}

// normalize
const normalize = (matrix) => {
  let maxSum = 0;
  let minSum = 0;
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      if (matrix[row][column] > maxSum) {
        maxSum = matrix[row][column];
      }
      if (matrix[row][column] < minSum) {
        minSum = matrix[row][column];
      }
    }
  }
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      //matrix[row][column] = (matrix[row][column] + maxSum) * (255 / (2 * maxSum));
      matrix[row][column] = (matrix[row][column] - minSum) / (maxSum - minSum) * 255;
      //if (row > 10) logLimited(row, column, matrix[row][column]);
    }
  }
};
normalize(matrixG);

// const putInData = (matrix) => {
//   for (let row = 0; row < matrix.length; row++) {
//     for (let column = 0; column < matrix[row].length; column++) {
      
//       const index = row * (WIDTH * 4) + (column * 4);
//       data[index] = matrix[row][column];
//       data[index+1] = matrix[row][column];
//       data[index+2] = matrix[row][column];
//     }
//   }
// };
// putInData(matrixG);

for (let row = 0; row < matrixG.length; row++) {
  for (let column = 0; column < matrixG[row].length; column++) {

  const lightning = matrixG[row][column] / 255 / 2;
  const rgb = hsl2rgb(matrixGradient[row][column], 1, lightning);

  const index = row * (WIDTH * 4) + (column * 4);
  if (0.299 * rgb[0]*255 + 0.587 * rgb[1]*255 + 0.114 * rgb[2]*255 > 100)
  logLimited(`%c ${row} ${column} rgb(${rgb[0]*255}, ${rgb[1]*255}, ${rgb[2]*255})`, `color:rgb(${rgb[0]*255},${rgb[1]*255},${rgb[2]*255})`);
  data[index] = rgb[0] * 255;
  data[index+1] = rgb[1] * 255;
  data[index+2] = rgb[2] * 255;
  data[index+3] = 255;
  }
}

ctx.putImageData(imageData, 0, 0);

canvas.addEventListener("mousemove", (event) => {
  const column = event.clientX;
  const row = event.clientY;
  if (row < 0 || row >= WIDTH || column < 0 || column >= HEIGHT) return;
  if (matrixG[row, column] < 100) return;

  const hover = document.getElementById("hover");
  hover.innerHTML = ""; 
  hover.innerHTML += "gradient: " + matrixGradient[row][column] + "<br />";
  hover.innerHTML += "g: " + matrixG[row][column] + "<br />";
  hover.innerHTML += `y: ${row}; x: ${column}<br />`;
  const lightning = matrixG[row][column] / 255 / 2;
  const rgb = hsl2rgb(matrixGradient[row][column], 1, lightning);
  rgb[0] *= 255; rgb[1] *= 255; rgb[2] *= 255;
  hover.innerHTML += "color:  " + `<span style="color: rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})">(${rgb[0]}, ${rgb[1]}, ${rgb[2]})</span>` + "<br />";

  hover.style.top = (event.clientY+50) + 'px';
  hover.style.left = (event.clientX) + 'px';
});

// input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
function hsl2rgb(h,s,l)  {
  let a=s*Math.min(l,1-l);
  let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
  return [f(0),f(8),f(4)];
}

var logIndex = 0;
function logLimited(...rest) {
  if (!logIndex) {
    logIndex = 1;
  }

  if (logIndex < 5000) {
    console.log(...rest);
    logIndex++;
  }
}