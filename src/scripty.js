//var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


var img = document.getElementById("scream");

const WIDTH = 700;
const HEIGHT = 525;

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
const kernels = [
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ],
  // [
  //   [1, 1, 1],
  //   [1, 1, 1],
  //   [1, 1, 1]
  // ],
  [
    [-2, 0, 2],
    [-4, 0, 4],
    [-2, 0, 2]
  ]
];
//const kernelSums = kernels.map(k => k.reduce((acc, curr) => acc + curr.reduce((a,c)=>a+c, 0), 0));
const kernelSums = [9, 1, 1];

const matrix = [[]];
for (let i=0; i < data.length-2; i+=4) {
  const row = parseInt(i / (WIDTH * 4));
  const column = (i % (WIDTH * 4)) / 4;
  
  if (row === 1) {
    console.log(matrix.length);
  }
  
  if (matrix.length <= row) {
    matrix.push([[]]);
  }
  if (row ===2) {
    console.log(column);
    console.log(matrix);
  }
  var sum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
  matrix[row][column] = sum;
}

let matrixFrom = matrix.map(a=>[...a]);
let matrixTo = matrix.map(a=>[...a]);

for (let kernelIndex = 0; kernelIndex < kernels.length; kernelIndex++) {
  const kernel = kernels[kernelIndex];

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

      matrixTo[row][column] = sum / kernelSums[kernelIndex];
    }
  }
  matrixFrom = matrixTo.map(a=>[...a]);
}

// normalize
let maxSum = 0;
for (let row = 0; row < matrixTo.length; row++) {
  for (let column = 0; column < matrixTo[row].length; column++) {
    if (matrixTo[row][column] > maxSum) {
      maxSum = matrixTo[row][column];
    }
  }
}
for (let row = 0; row < matrixTo.length; row++) {
  for (let column = 0; column < matrixTo[row].length; column++) {
    matrixTo[row][column] = (matrixTo[row][column] + maxSum) * (255 / (2 * maxSum));
  }
}


//debugger;

//console.log('row', row, 'column', column);
//var sum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
  /* var sum = 0.33 * data[i] + 0.33 * data[i+1] + 0.33 * data[i+2] */
  /* data[i] = sum;
  data[i+1] = sum;
  data[i+2] = sum; */
  /*if  (sum < 40) {
    data[i+3] = 0;
  } */

for (let row = 0; row < matrixTo.length; row++) {
  for (let column = 0; column < matrixTo[row].length; column++) {
    
    const index = row * (WIDTH * 4) + (column * 4);
    data[index] = matrixTo[row][column];
    data[index+1] = matrixTo[row][column];
    data[index+2] = matrixTo[row][column];
  }
}


ctx.putImageData(imageData, 0, 0);

