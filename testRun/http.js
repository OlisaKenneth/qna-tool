const express = require('express');
const app = express();

app.use(express.json());

app.get("/users", (req, res)=>{
    res.json({id:5, name: "ada"})
})

app.post("/login", (req,res)=>{
    res.json({received: req.body});
});

app.put("/users/5", (req,res)=>{
    res.json({updated:req.body})
});

app.delete("/users/5", (req,res)=>{
    res.status(200).json({message: "user5 Deleted"});
});

app.use((req,res)=>{
    res.status(404).json({error:"not found"});
});

app.listen(3000, ()=>{
    console.log("the server is running on port 3000...");
});