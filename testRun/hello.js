// console.log("Hello world!");

// let count =0
// count = count+1
// console.log(count)

// const user={name: "ada"};
// user.name="tomez";
// console.log(user.name)


// let x = 8;
// for(let i=0; i<x; i++){
//     console.log(i);
// }


// function add(x,y){
//     return(x*2*y);
// }

// console.log(add(3,4));



// const subtraction = (r,y) => (y-r);
// console.log(subtraction(34,62))


//this is an object
const vart = {
    name: "kenneth", 
    age:"32",
    greet(){
        return "hi my name is "+ vart.name;
    }
    };
// console.log(vart.greet());

//object to JSON
const json = JSON.stringify(vart);
console.log("this is JSON: ", json);


//JSON to object
const obj = JSON.parse(json);
console.log("this is object :", obj);