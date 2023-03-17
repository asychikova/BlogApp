/*********************************************************************************
*  WEB322 – Assignment 03
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

const fs = require("fs");
let posts = [];
let categories = [];

function initialize () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) {reject("unable to read file");}
             else { categories = JSON.parse(data);
                fs.readFile('./data/posts.json', 'utf8', (err, data) => {
                    if (err) {reject("unable to read file");}
                     else {
                        posts=JSON.parse(data);
                        resolve();}
                    });
                }
            });
        });
    }

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length==0) {
            reject("No results returned");
        } else {resolve(posts);}
    });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
  const publishedPosts=posts.filter(post => post.published==true);
      if (publishedPosts.length==0) {
          reject("No results returned");
      } else {resolve(publishedPosts);}
  });
}

function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const publishedPostsByCategory = posts.filter(post => post.published == true && post.category == category);
    if (publishedPostsByCategory.length == 0) {
      reject("No results returned");
    } else {
      resolve(publishedPostsByCategory);
    }
  });
}

function getCategories () {
  return new Promise((resolve, reject) => {
      if (categories.length==0) {
          reject("No results returned");
      } else {resolve(categories);}
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    const postDate = new Date().toISOString().slice(0, 10); //I saw slice method about 1 or 2 weeks ago on Instagram and I save 
    // it for the future. There was example of splice, slice and another methods and now I decided to try one of them in my code 
    // there is a link: https://www.instagram.com/p/ClY6-dqDVqv/?igshid=YmMyMTA2M2Y=
    const post = {
      id: posts.length + 1,
      body: postData.body,
      title: postData.title,
      postDate: postDate,
      category: parseInt(postData.category),
      featureImage: postData.featureImage,
      published: Boolean(postData.published),
    };
    posts.push(post);
    resolve();
  });
} 

 /*
function addPost (postData) {
  return new Promise((resolve, reject) => {
    let post = {
      id: posts.length + 1,
      body: postData.body,
      title: postData.title,
      postDate: new Date().toISOString(),
      category: parseInt(postData.category),
      featureImage: postData.featureImage,
      published: Boolean(postData.published),
    };
    console.log(post);
    posts.push(post);
    resolve();
  });
}; */

async function getPostsByCategory(category) {
  try {
    const posts = await getAllPosts();
    const filteredPosts = posts.filter((post) => post.category === category);
  
    if (filteredPosts.length === 0) {
      throw "No results returned(Category)";
    } else {
     const sortedPosts = filteredPosts.sort((a, b) => a.id - b.id);
      return sortedPosts;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getPostsByMinDate(minDate) {
  try {
    const posts = await getAllPosts();
    const filteredPosts = posts.filter(
      (post) => new Date(post.postDate).toISOString() >= new Date(minDate).toISOString()
    );
    if (filteredPosts.length === 0) {
      throw "No results returned(minDate)";
    } else {
      const sortedPosts = filteredPosts.sort((a, b) => new Date(a.postDate) - new Date(b.postDate));
      return sortedPosts;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === parseInt(id));
    if (post) {
      resolve(post);
    } else {
      reject(`Post not found`); 
    }
  });
}

/* function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === id);
    if (post) {
      resolve(post);
    } else {
      reject(`Post not found`); 
    }
  });
} */
  
module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  getPublishedPostsByCategory,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById
} 






