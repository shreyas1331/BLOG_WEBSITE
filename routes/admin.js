const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const User = require("../models/user");


router.get("/dashboard", async (req, res) => {
    const  role  = req.session.role;
    console.log(role);
  
    if (role === 'admin') {
      const pendingPosts = await Post.find({ status: 'pending' }).populate("author.id").exec();
      console.log("Pending Posts:", pendingPosts);
      res.render("dashboard",{ pendingPosts }); 
    } else {
      res.status(403).send("Permission denied");
    }
  });
  router.get("/approvePost/:postId", async (req, res) => {
    const postId = req.params.postId;
  
    const role  =  req.session.role;
  
    if (role === 'admin') {
      const post = await Post.findByIdAndUpdate(postId, { status: 'approved' }, { new: true });
  
      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      res.redirect("/admin/dashboard");
    } else {
      res.status(403).send("Permission denied");
    }
  });
  router.post("/rejectPost/:postId", async (req, res) => {
    const postId = req.params.postId;
    const role  =  req.session.role;
  
    if (role === 'admin') {
      const post = await Post.findByIdAndDelete(postId);
  
      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      res.redirect("/admin/dashboard");
    } else {
      res.status(403).send("Permission denied");
    }
  });

module.exports = router;