// function loopp(array, Callback){
//     var sum=0;
//     for(let i=0; i<array.length; i++){
//         Callback(i, array[i]);
//         sum+=array[i]
//     }
//     return sum;
// }

// const theArray = [10,22,34,666,889,96];
// const value = loopp(theArray, (item, value)=>console.log('we are processing the position', item, ": the value is ", value));
// console.log("the sum of all values are : "+ value);

// const doubled = [];
// function doubledIt(item, tt) {
//     doubled.push(tt*2);
// }
// loopp(theArray, doubledIt)
// console.log("doubled =", doubled);



// let count =0;
// function loopWithTimeOut(){
//     count++;
//     console.log("tick", count);

//     if(count>=5){
//         return;
//     };
    
//     setTimeout(loopWithTimeOut, 3000);
// }
// loopWithTimeOut();




// let secondCount = 25;
// const intervalId = setInterval(()=>{
//     console.log(secondCount);
//     secondCount--;
    
//     if(secondCount <0){
//         clearInterval(intervalId);
//         console.log("program done");
//     }},

    
//     4000);



function coinFlipPromise(){
    return new Promise((resolve, reject)=>{
        var x = Math.floor(Math.random()*100);
        if(x<50){
            resolve({x, msg: "OK"});
        }else{
            reject(new Error("Error, x=", x));
        }
    });
}
for(let i=0; i<30; i++){
    coinFlipPromise()
        .then(result=> console.log("fufilled:", result))
        .catch(err => console.error("rejected:", err.message))
        // .finally(()=> console.log("done"));
}