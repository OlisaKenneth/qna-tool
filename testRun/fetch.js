// fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
//     .then(response=>response.json())
//     .then(data=> console.log(data))
//     .catch(error => console.error(error));



function applyTwice(x, f) {
    return f(f(x));
    // f(n,x);
}
console.log(applyTwice(3, n => n + 1)); // 5
console.log(applyTwice(2, n => n * 10)); // 200


const fs = require('node:fs');
// fs.readFile('./fetchData.txt', 'utf-8' ())