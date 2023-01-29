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
        console.log("Can't load blog."+ err);
    });

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("/about");
   });


app.get("/about", (req, res) => {
 res.sendFile(__dirname + "/views/about.html");
});

app.get('/blog', (req, res) => {
    blogService.getAllPosts()
        .then((posts) => {
            res.json(posts);
        })
        .catch((err) => {
          console.log("Can't load all posts." + err);
        });
});

app.get("/posts", (req, res) => {
  blogService.getPublishedPosts()
  .then((PublishedPosts) => {
      res.json(PublishedPosts);
  })
  .catch((err) => {
      res.json({error: err});
  });
});

app.get("/categories", (req, res) => {
  blogService.getCategories()
  .then((categories) => {
      res.json(categories);
  })
  .catch((err) => {
      console.log("Can't load categories." + err);
  });
});

app.get("*", (req, res) => {
    res.status(404).send("Page Not Found 404!!!"); //design
});