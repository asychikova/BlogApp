
const express = require("express");
const app = express();
/*const blogService = require('./blog-service');*/

app.use(express.static("public"));

app.listen(process.env.PORT || 8080, () => {
  console.log("Express http server listening on port", 8080);
});

app.get("/", (req, res) => {
    res.redirect("/about");
   });


app.get("/about", (req, res) => {
 res.sendFile(__dirname + "/views/about.html");
});

/**/app.get("/blog", (req, res) => {
    //TODO: Retrieve all posts from the posts.json file where published property is true
    res.send("TODO: get all posts who have published==true");
});

/**/app.get("/posts", (req, res) => {
    //TODO: Retrieve all posts from the posts.json file
    res.send("TODO: get all posts");
});

/**/app.get("/categories", (req, res) => {
    //TODO: Retrieve all categories from the categories.json file
    res.send("TODO: get all categories");
});

app.get("*", (req, res) => {
    res.status(404).send("Page Not Found");
});

////////step5
/*
blogService.initialize()
    .then(() => {
        //start the server
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    })
    .catch(err => {
        //output the error to the console
        console.error(err);
    });
*/
/*
var express = require("express");
var app = express();
var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
*/