// const express = require("express");
// const app = express();

function foo(array, callback) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    callback(array[i]);
    sum += array[i];
  }
  return sum;
}

// app.get("/", (req, res) => {
  const numbers = [10, 20, 30, 50];

  const total = foo(numbers, (item) => {
    console.log("processing " + item);
  });

  console.log("Total is " + total);
// });

// app.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });