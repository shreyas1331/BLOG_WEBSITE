const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const User = require("../models/user");
const SibApiV3Sdk = require('sib-api-v3-sdk');

function checkIfLoggedIn(req,res,next){
    if(req.session.isLoggedIn){
        return next();
    }else{
        res.redirect("/login");
    }
}
const isAuthor = async (req, res, next) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      const currentUser = req.session.user;
  
      if (!currentUser || !currentUser._id) {
        return res.status(403).send("Unauthorized");
      }
  
      // Check if the current user is the author of the post
      if (post.author.id.equals(currentUser._id)) {
        next(); // User is the author, proceed to the next middleware
      } else {
        res.status(403).send("Unauthorized");
      }
    } catch (error) {
      console.error("Error in isAuthor middleware:", error);
      res.status(500).send("Internal Server Error");
    }
  };
//to render all posts
router.get("/", async (req, res) => {
    try {
      const allPosts = await Post.find({ status: 'approved' });
      res.render("posts/index", {
        posts: allPosts.reverse(),
        currentUser: req.user,
        userLoggedIn: req.session.isLoggedIn,
      });
    } catch (err) {
      console.log("Error in find");
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  });
  router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const posts = await Post.find({ category, status: 'approved' }).sort({ name: 'asc' });
        const categories = await Post.distinct("category");

        res.render("posts/index", {
            posts: posts.reverse(),
            currentUser: req.user,
            categories,
            selectedCategory: category,
        });
    } catch (err) {
        console.log("Error in find");
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/filterByCategory", async (req, res) => {
    try {
        const selectedCategory = req.body.categoryFilter;
        if (selectedCategory) {
            return res.redirect(`/posts/category/${selectedCategory}`);
        } else {
            return res.redirect("/posts");
        }
    } catch (err) {
        console.log("Error in category filter");
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

// add a new post
  router.post("/", checkIfLoggedIn, async (req, res) => {
    try {
        const { name, image, description, category } = req.body;
        const currentUser = req.session.user;
        const role = req.session.role;
        
        if (!currentUser || !currentUser._id || !currentUser.username) {
            console.error("Invalid user data");
            return res.status(500).send("Internal Server Error");
        }

       
        const newPost = new Post({
            name,
            image,
            description,
            category,
            author: {
                id: currentUser._id, 
            },
        });
        if (role === 'admin') {
            newPost.status = 'approved';
          } else {
            newPost.status = 'pending';
          }
      
        await newPost.save();
        
        res.redirect("/posts");
    } catch (error) {
        console.error("Error creating new post:", error);
        res.status(500).send("Internal Server Error");
    }
});





    //show new post
    router.get("/publish",checkIfLoggedIn, (req, res) => {
      res.render("posts/new");
    });


   // show post by id
router.get("/:id", async (req, res) => {
    try {
      const foundPost = await Post.findById(req.params.id).populate("author.id").exec();
      console.log(foundPost.author.id.username);
      res.render("posts/show", { post: foundPost });
    } catch (err) {
      console.log("Error occurred in finding ID");
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });

    //edit post
    router.get("/:id/edit",isAuthor, async (req, res) => {
        try {
          const foundPost = await Post.findById(req.params.id);
          res.render("Posts/edit", { post: foundPost });
        } catch (err) {
          console.log("Error occurred in finding ID");
          console.log(err);
          res.status(500).send("Internal Server Error");
        }
      });

      
      
     
   
   // Update post
router.post("/:id", isAuthor, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description,category } = req.body.post || req.body; 
        console.log("ID:", id);
        console.log("Name:", name);
        console.log("Image:", image);
        console.log("Description:", description);
        console.log("Category:", category);
        let post = await Post.findOne({ _id: id });

        if (!post) {
            return res.status(404).send("Post not found");
        }

        post.name = name;
        post.image = image;
        post.description = description;
        post.category = category;

        await post.save();
        res.redirect(`/posts/${id}`);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).send("Internal Server Error");
    }
});

//delete post
router.post("/:id/delete",isAuthor, async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).send("Post not found");
        }
        res.redirect("/posts");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;