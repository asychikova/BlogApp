/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*   EXCEPT web322 course official page: https://web322.ca/
* 
*  Name: Anna Sychikova Student ID: 159363217 Date: I started 3/4 of April
*
*  Cyclic Web App URL: https://outrageous-boa-gown.cyclic.app 
*
*  GitHub Repository URL: https://github.com/asychikova/web322appAnna
*
********************************************************************************/ 

const express = require("express");
const app = express();

const exphbs = require("express-handlebars");
const Handlebars = require("handlebars"); 

const path = require("path");

const clientSessions = require('client-sessions');
const multer = require("multer");

const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const blogService = require("./blog-service");

const stripJs = require("strip-js");

const authData = require('./auth-service'); 

app.use(express.urlencoded({extended: true}));
app.use(clientSessions({
  cookieName: 'session',
  secret: 'GoodDay',
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

const fs = require("fs");
const http = require("http");
const https = require("https");

const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = 4433;

const ASSETS = "./assets/";

const SSL_KEY_FILE = ASSETS + "server.key";
const SSL_CRT_FILE = ASSETS + "server.crt";

const https_options = {
    key: fs.readFileSync(__dirname + "/" + SSL_KEY_FILE),
    cert: fs.readFileSync(__dirname + "/" + SSL_CRT_FILE)
};

function ensureLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(express.static("public"));

const upload = multer();

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

const formatDate = function(dateObj){
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
};

Handlebars.registerHelper("formatDate", formatDate);

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
     // posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
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

app.get("/posts", ensureLogin, async (req, res) => {
  let category = req.query.category;
  let minDate = req.query.minDate;

  if (category) {
    category = parseInt(category);
    try {
      const filteredPosts = await blogService.getPostsByCategory(category);
      if (filteredPosts.length > 0) {
        res.render("posts", {posts: filteredPosts});
      } else {
        res.render("posts", {message: "no results"});
      }
    } catch (err) {
      res.render("posts", {message: err});
    }
  } else if (minDate) {
    try {
      const filteredPosts = await blogService.getPostsByMinDate(minDate);
      if (filteredPosts.length > 0) {
        res.render("posts", {posts: filteredPosts});
      } else {
        res.render("posts", {message: "no results"});
      }
    } catch (err) {
      res.render("posts", {message: err});
    }
  } else {
    try {
      const posts = await blogService.getAllPosts();
      if (posts.length > 0) {
        posts.sort((a, b) => (new Date(a.postDate) - new Date(b.postDate)));
        res.render("posts", {posts: posts});
      } else {
        res.render("posts", {message: "no results"});
      }
    } catch (err) {
      res.render("posts", {message: err});
    }
  }
});

app.get("/post/:id", ensureLogin, (req, res) => {
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

app.get("/categories", ensureLogin, (req, res) => {
  blogService.getCategories()
    .then((categories) => {
      if (categories.length > 0) {
        res.render("categories", { categories: categories });
      } else {
        res.render("categories", { message: "No results found" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: err });
    });
});

app.get("/posts/add", ensureLogin, async (req, res) => {
  try {
    const categories = await blogService.getCategories();
    res.render("addPost", { categories });
  } catch (err) {
    console.log(err);
    res.render("addPost", { categories: [] });
  }
});

  app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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
  
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
}); 

app.post("/categories/add", ensureLogin, (req, res) => {
  blogService
    .addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.send({ message: err });
    });
});
  
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  blogService
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blogService.deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});

  cloudinary.config({
    cloud_name: 'dixlrbgil',
    api_key: '264933176431443',
    api_secret: 'AHNrJUccXxIK6k7Dvx-siA-AGuk',
    secure: true
  });

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post("/register", function(req, res) {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", { errorMessage: err, userName: req.body.userName });
    });
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
        res.redirect('/posts');
      })
      .catch((err) => {
        res.render('login', {
          errorMessage: err,
          userName: req.body.userName
        });
      });
  });

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory', {
    title: '${req.session.user.userName} ( ${req.session.user.email} ) History',
    loginHistory: req.session.user.loginHistory
  });
});

app.get("*", (req, res) => {
  res.render("errorpage", {errorMessage: "ERROR 404"});
});

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

function onHttpsStart() {
  console.log("Express https server listening on: " + HTTPS_PORT);
}

blogService.initialize()
.then(() => {
  return authData.initialize();
})
.then(() => {
  http.createServer(app).listen(HTTP_PORT, onHttpStart);
  https.createServer(https_options, app).listen(HTTPS_PORT, onHttpsStart);
})
.catch((err) => {
  console.log("Can't load blog."+ err);
});
