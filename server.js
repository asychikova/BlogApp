/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Anna Sychikova Student ID: 159363217 Date: ~12 of Feb (or earlier(when assignment was uploaded))
*
*  Cyclic Web App URL: https://outrageous-boa-gown.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/asychikova/web322appAnna
*
********************************************************************************/ 

const express = require("express");
const app = express();
const path = require("path");

const multer = require("multer");
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const blogService = require("./blog-service");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: true }));
const upload = multer();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
 });

app.get("/about", (req, res) => {
res.sendFile(__dirname + "/views/about.html");
});

app.get('/blog', (req, res) => {
blogService.getPublishedPosts()
.then((posts) => {
  res.send(posts);
})
.catch((err) => {console.log("Can't load all posts." + err);});
});

app.get("/posts", (req, res) => {
  let category = req.query.category;
  let minDate = req.query.minDate;

  if (category) {
    category = parseInt(category);
    blogService.getPostsByCategory(category)
    .then((filteredPosts) => {
      res.send(filteredPosts);
      })
      .catch((err) => {
        res.send({ message: err });
      });
  } else if (minDate) {
    blogService.getPostsByMinDate(minDate)
    .then((filteredPosts) => {
      res.send(filteredPosts);
      })
      .catch((err) => {
        res.send({ message: err });
      });
  } else {
    blogService.getAllPosts()
      .then((posts) => {
        res.send(posts);
      })
      .catch((err) => {
        res.send({ message: err });
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
      res.status(404).send({ message: `Post with ID ${id} not found` });
    });
});

app.get("/categories", (req, res) => {
blogService.getCategories()
.then((categories) => {
  res.send(categories);
})
.catch((err) => {console.log("Can't load categories. " + err);});
});

app.get("/posts/add", (req, res) => {
  res.sendFile(__dirname + "/views/addPost.html");
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
  
  app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });
  
  cloudinary.config({
    cloud_name: 'dixlrbgil',
    api_key: '264933176431443',
    api_secret: 'AHNrJUccXxIK6k7Dvx-siA-AGuk',
    secure: true
  });

  blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on port", + HTTP_PORT);
    });
  })
  .catch((err) => {console.log("Can't load blog."+ err);});
  app.get("*", (req, res) => {res.sendFile(__dirname + "/views/errorpage.html");});