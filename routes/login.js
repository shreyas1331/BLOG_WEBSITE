const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const bcrypt=require('bcrypt');

router.get("/register",(req,res)=>{
  res.render("register");
})
router.post("/register",async (req,res)=>{
  const {username,password}=req.body;
  const newUser=new User({username,password});
  await newUser.save();
 
    res.redirect("/posts");
})

router.get("/", (req, res) => {
    res.render("landing");
  });

  // show login form
router.get("/login", (req, res) => {
  res.render("login");
});


router.post('/login', async (req, res) => {
  const {username,password}=req.body;
  let user=await User.findOne({username:username});   
      if(user){
          if(user.password!=password){
              res.redirect("/login");
             
          }else{
              req.session.isLoggedIn=true;
              req.session.user=user;
              req.session.role=user.role;
              res.redirect("/posts");
          }
      }else{
          res.send("no such user found");
      }
   
})
// const securepassword=async(password)=>{
//   const passHash=await bcrypt.hash(password,10);
//   console.log(passHash);
// }

//logic route
router.get("/logout", (req, res) => {
  // Clear the session data
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Redirect to the desired page after logout
      res.redirect("/posts");
    }
  });
});

  module.exports = router;
