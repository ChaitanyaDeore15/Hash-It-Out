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

//user signup page
app.get("/user_signup",(req,res)=>{
    res.render("user_signup");
})

app.post("/user_signup",(req,res)=>{
    const {userId,username,password} = req.body;
    let q = `INSERT INTO users(id,username, password) VALUE('${userId}','${username}','${password}') `;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/user_login");
        });
    }catch(err){
        alert(err);
    }
});

app.get("/",(req,res)=>{
    res.render("profession");
});

//getting user login
app.get("/user_login",(req,res)=>{
    res.render("user_login",{message : null});
})
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
    res.render("user_home")
});

//user_home page
app.get("/user/:id",(req,res)=>{
    const {userId} = req.params;
    let get_user = `SELECT * FROM users WHERE id = ?`;
    let get_history_complaints = `SELECT * FROM complaints_history WHERE userId = ?`;
    connection.query(get_user,[userId],(err,result_user)=>{
        if (err) throw err;
        if (result_user.length>0){
            connection.query(get_history_complaints, [userId], (err, result_history_complaint) => {
                if (err) throw err;

                res.render("user_home", { 
                    user: result_user[0], 
                    history_complaints: result_history_complaint
                });
            });
        }else {
            res.send("User not found");
        }
     })
});

//authority signup page
app.get("/authority_signup",(req,res)=>{
    res.render("authority_signup");
})

app.post("/authority_signup",(req,res)=>{
    const {authorityId,username,email,password} = req.body;
    let q = `INSERT INTO authorities(authorityId,username, email,password) VALUE('${authorityId}','${username}',${email},'${password}') `;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            res.redirect("/authority_login");
        });
    }catch(err){
        alert(err);
    }
});

//authority login
app.post("/authority_login",(req,res)=>{
    const {username,password} = req.body;
    let q=`SELECT * FROM authorities WHERE name = ?`;
    connection.query(q,[username] , (err, result)=>{
        if (err) throw err;
        if (result.length > 0) {
            const authority = result[0];
            if(password == authority.password){
                res.redirect(`/authority/${authority.id}`);
            }
            else{
                res.render("authority_login",{ message: "Invalid Username or Password" });
            }
        } else {
            res.render("authority_login",{ message: "No such student found" });
        }
    })
});

//authority_home page
app.get("/authority/:id",(req,res)=>{
    const {authorityId} = req.params;
    let get_authority = `SELECT * FROM authorities WHERE id = ?`;
    let get_complaints = `SELECT * FROM complaint_store `;
    connection.query(get_authority,[authorityId],(err,result_authority)=>{
        if (err) throw err;
        if (result_user.length>0){
            connection.query(get_complaints, (err, result_complaints) => {
                if (err) throw err;

                res.render("authority_home", { 
                    user: result_authority[0], 
                    complaints : result_complaints
                });
            });
        }else {
            res.send("Authority not found");
        }
     })
});



app.listen('3000',()=>{
    console.log("Server is running.");
    connection.query("SHOW TABLES");
})