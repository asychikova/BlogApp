/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Anna Sychikova Student ID: 159363217 Date: 13 of Feb 
*
*  Cyclic Web App URL: https://outrageous-boa-gown.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/asychikova/web322appAnna
*
********************************************************************************/ 

const stripJs = require("strip-js");

const express = require("express");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars"); 

const app = express();
const path = require("path");

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

const multer = require("multer");
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const blogService = require("./blog-service");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: true }));
const upload = multer();

 app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

Handlebars.registerHelper("navLink", function(url, options){
  return '<li' + 
      ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
});
Handlebars.registerHelper("equal", function (lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
});

Handlebars.registerHelper("safeHTML", function(context) {
  return stripJs(context);
});

app.use(express.static("public"));

module.exports = app;

app.get("/", (req, res) => {
  res.redirect("/blog");
 });

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try{
      // declare empty array to hold "post" objects
      let posts = [];
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }
      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 
      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;
  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try{
      // declare empty array to hold "post" objects
      let posts = [];
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }
      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results 1";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results 2"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results 3"
  }
  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});


app.get("/posts", (req, res) => {
  let category = req.query.category;
  let minDate = req.query.minDate;

  if (category) {
    category = parseInt(category);
    blogService.getPostsByCategory(category)
    .then((filteredPosts) => {
      res.render("posts", {posts: filteredPosts});
      })
      .catch((err) => {
        res.render("posts", {message: err});
      });
  } else if (minDate) {
    blogService.getPostsByMinDate(minDate)
    .then((filteredPosts) => {
      res.render("posts", {posts: filteredPosts});
      })
      .catch((err) => {
        res.render("posts", {message: err});
      });
  } else {
    blogService.getAllPosts()
      .then((posts) => {
        res.render("posts", {posts: posts});
      })
      .catch((err) => {
        res.render("posts", {message: err});
      });
  }
});

app.get("/post/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log("ID:", id);
  blogService
    .getPostById(id)
    .then((post) => {
      console.log("Post:", post);
      res.send(post);
    })
    .catch((err) => {
      console.log("Error:", err);
      res.status(404).send({ message: "Post with ID ${id} not found" });
    });
});

app.get("/categories", (req, res) => {
  blogService.getCategories()
    .then((categories) => {
      res.render("categories", { categories: categories });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/posts/add", (req, res) => {
  res.render("addPost");
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
  
      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost("");
    }

    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
      blogService
        .addPost(req.body)
        .then(() => {
          res.redirect("/posts");
        })
        .catch((err) => {
          res.send({ message: err });
        });
      }
  });
  
  cloudinary.config({
    cloud_name: 'dixlrbgil',
    api_key: '264933176431443',
    api_secret: 'AHNrJUccXxIK6k7Dvx-siA-AGuk',
    secure: true
  });

  app.get("*", (req, res) => {
    res.render("errorpage", {errorMessage: "ERROR 404"});
  });
  
  blogService
    .initialize()
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on port", + HTTP_PORT);
      });
    })
    .catch((err) => {
      console.log("Can't load blog."+ err);
    });