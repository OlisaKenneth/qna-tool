const express = require("express");
const app = express();

app.get("/", (req,res)=>{
    res.send("welcome to my website");
})

app.get("/hello", (req, res)=>{
    res.send("Hello");
})

var count = 0;
app.get("/count", (req, res)=>{
    count++;
    res.json({"count" : count});
})

app.get("/reset", (req, res)=>{
    count=0;
    res.send("the webpage /count has been reset to " + count+" times");

})

app.listen(3000, ()=>{
    console.log("website is working on http://localhost:3000");
});