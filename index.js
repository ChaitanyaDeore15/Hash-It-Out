const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "complaint_portal",
    password: "pass123"
});

connection.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL Database");
});

// User Signup Page
app.get("/user_signup", (req, res) => {
    res.render("user_signup");
});

app.post("/user_signup", (req, res) => {
    const { userId, username, password, email } = req.body;
    let q = `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`;
    
    connection.query(q, [userId, username, email, password], (err, result) => {
        if (err) {
            console.error("❌ Error inserting user:", err.message);
            return res.send("Error signing up.");
        }
        res.redirect("/user_login");
    });
});

// Home Page
app.get("/", (req, res) => {
    res.render("profession");
});

// User Login
app.get("/user_login", (req, res) => {
    res.render("user_login", { message: null });
});

app.post("/user_login", (req, res) => {
    const { username, password } = req.body;
    let q = `SELECT * FROM users WHERE name = ?`;

    connection.query(q, [username], (err, result) => {
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
            res.render("user_login",{ message: "No such teacher found" });
        }
    });
});

// User Home Page
app.get("/user/:id", (req, res) => {
    const { id } = req.params;
    let get_user = `SELECT * FROM users WHERE id = ?`;
    let get_history = `SELECT * FROM complaint_store WHERE userid = ?`;
    connection.query(get_user,[id],(err,result_user)=>{
        if (err) throw err;
        user = result_user[0];
        connection.query(get_history,[id],(req,result_history)=>{
            res.render("user_home",{user : user, complaints : result_history});
        })
    })    
});

//new_complaint page rendering
app.post("/user/:id/new_complaints",(req,res)=>{
    const {id} = req.params;
    let get_user = `SELECT * FROM users WHERE id = ?`;
    connection.query(get_user,[id],(err,result_user)=>{
        if (err) throw err;
        user = result_user[0];
        res.render("new_complaint",{user});
    })
});



//adding complaint
app.post("/user/:id/new_complaints/added",(req,res)=>{
    const {id} = req.params;
    const{state,city,complaint}= req.body;
    let insert_complaint = `INSERT INTO complaint_store(userid,state,city,complaint,status) VALUE(?,?,?,?,"Not Completed")`;
    connection.query(insert_complaint,[id,state,city,complaint],(req,result_inserted)=>{
        console.log("Inserted");
        res.redirect(`/user/${id}`);
    })
})
// Authority Signup Page
app.get("/authority_signup", (req, res) => {
    res.render("authority_signup");
});

app.post("/authority_signup", (req, res) => {
    const { authorityId, username, email, password } = req.body;
    let q = `INSERT INTO authorities (authorityId, username, email, password) VALUES (?, ?, ?, ?)`;

    connection.query(q, [authorityId, username, email, password], (err, result) => {
        if (err) {
            console.error("❌ Error inserting authority:", err.message);
            return res.send("Error signing up.");
        }
        res.redirect("/authority_login");
    });
});

// Authority Login
app.get("/authority_login", (req, res) => {
    res.render("authority_login", { message: null });
});

app.post("/authority_login", (req, res) => {
    const { username, password } = req.body;
    let q = `SELECT * FROM authorities WHERE username = ?`;

    connection.query(q, [username], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const authority = result[0];
            if(password == authority.password){
                res.redirect(`/authority/${authority.authorityid}`);
            }
            else{
                res.render("authority_login",{ message: "Invalid Username or Password" });
            }
        } else {
            res.render("authority_login",{ message: "No such teacher found" });
        }
    });
});

// Authority Home Page
app.get("/authority/:id", (req, res) => {
    const { id } = req.params;
    let get_authority = `SELECT * FROM authorities WHERE authorityid = ?`;
    let get_complaints = `SELECT * FROM complaint_store`;

    connection.query(get_authority, [id], (err, result_authority) => {
        if (err) throw err;
        authority = result_authority[0];
        if (result_authority.length>0){
            connection.query(get_complaints,(err,result_complaints)=>{
                res.render("authority_home",{authority : authority,complaints : result_complaints});
            })
        }
    });
});

//update
app.post("/:authorityid/:complaintid/updated",(req,res)=>{
    const {authorityid,complaintid} = req.params;
    let q = `UPDATE complaint_store SET status = "Completed" where complaintid = ?`;
    connection.query(q,[complaintid],(req,result)=>{
        res.redirect(`/authority/${authorityid}`);
    })
})

// Start Server
app.listen(3000, () => {
    console.log("🚀 Server is running on port 3000.");
});
