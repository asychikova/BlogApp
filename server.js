/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Anna Sychikova Student ID: 159363217 Date: 30 of Jan (starded 25/26)
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: https://github.com/asychikova/web322appAnna
*
********************************************************************************/ 

const express = require("express");
const app = express();

app.use(express.static("public"));
var HTTP_PORT = process.env.PORT || 8080;
const blogService = require('./blog-service');

app.get("/", (req, res) => {
    res.redirect("/about");
   });

app.get("/about", (req, res) => {
 res.sendFile(__dirname + "/views/about.html");
});

app.get('/blog', (req, res) => {
  blogService.getAllPosts()
  .then((posts) => {
    res.send(posts);
  })
  .catch((err) => {console.log("Can't load all posts." + err);});
});

app.get("/posts", (req, res) => {
  blogService.getPublishedPosts()
  .then((PublishedPosts) => {
    res.send(PublishedPosts);
  })
  .catch((err) => {console.log("Can't load published posts. " + err);});
});

app.get("/categories", (req, res) => {
  blogService.getCategories()
  .then((categories) => {
    res.send(categories);
  })
  .catch((err) => {console.log("Can't load categories. " + err);});
});

app.get("*", (req, res) => {res.sendFile(__dirname + "/views/errorpage.html");});

blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on port", + HTTP_PORT);
    });
  })
  .catch((err) => {console.log("Can't load blog."+ err);});