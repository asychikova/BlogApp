const express = require("express");
const app = express();


const blogService = require('./blog-service');

blogService.initialize()
    .then(() => {
        app.listen(process.env.PORT || 8080, () => {
          console.log("Express http server listening on port", 8080);
        });
    })
    .catch((err) => {
        console.log(err);
    });

/*const blogService = require('./blog-service.js');

app.get('/blog', (req, res) => {
    blogService.getAllPosts()
      .then((posts) => {
        res.json(posts);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  }); */

/*blogService.initialize()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log("Express http server listening on port", 8080);
    });
  })
  .catch((err) => {
    console.log(err);
  }); */

app.use(express.static("public"));

/*app.listen(process.env.PORT || 8080, () => {
  console.log("Express http server listening on port", 8080);
});*/

app.get("/", (req, res) => {
    res.redirect("/about");
   });


app.get("/about", (req, res) => {
 res.sendFile(__dirname + "/views/about.html");
});

/*app.get("/blog", (req, res) => {
    //TODO: Retrieve all posts from the posts.json file where published property is true
    res.send("TODO: get all posts");
});
app.get("/blog", (req, res) => {
    blogService.getPublishedPosts()
        .then(posts => res.send(posts))
        .catch(err => console.log(err));
});*/
app.get('/blog', (req, res) => {
    blogService.getAllPosts()
        .then((posts) => {
            res.json(posts);
        })
        .catch((err) => {
            res.json({error: err});
        });
});

app.get("/posts", (req, res) => {
    //TODO: Retrieve all posts from the posts.json file
    res.send("TODO: get all posts");
});

app.get("/categories", (req, res) => {
    //TODO: Retrieve all categories from the categories.json file
    res.send("TODO: get all categories");
});

app.get("*", (req, res) => {
    res.status(404).send("Page Not Found 404!!!"); //how to make a design
});