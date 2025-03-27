const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");

app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    database : 'complaint_portal',
    password : 'pass123'
});

//getting user login
app.get("/",(req,res)=>{
    res.render("profession");
});

app.post("/user_login",(req,res)=>{
    const {username,password} = req.body;
    let q=`SELECT * FROM users WHERE name = ?`;
    connection.query(q,[username] , (err, result)=>{
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            if(password == user.password){
                res.redirect(`/user/${user.id}`);
            }
            else{
                res.render("user_login",{ message: "Invalid Username or Password" });
            }
        } else {
            res.render("user_login",{ message: "No such student found" });
        }
    })
});



app.get("/user_login",(req,res)=>{
    res.render("user_login",{message : null});
})

app.listen('3000',()=>{
    console.log("Server is running.");
})