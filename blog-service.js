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

const Sequelize = require('sequelize');
const { Op } = require('sequelize');

var sequelize = new Sequelize('zbjnypvr', 'zbjnypvr', 'KjxqfrAWpJ-9Ffz7VIP1drIwuOT6NAlq', {
    host: 'suleiman.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    
});

const fs = require("fs");
let posts = [];
let categories = [];

const Post = sequelize.define('Post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

sequelize.sync();

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject("Unable to sync the database");
      });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then(posts => {
        if (posts.length === 0) {
          reject("No results returned (posts)");
        } else {
          resolve(posts);
        }
      })
      .catch(error => {
        reject("Unable to get all posts");
      });
  });
}

async function getPublishedPosts() {
  try {
    const posts = await Post.findAll({
      where: {
        published: true
      },
      order: [['id', 'DESC']]    
    });
    return posts;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

function getPublishedPostsByCategory(category) {
  return Post.findAll({
    where: {
      published: true,
      category: category
    }
  })
  .then(posts => {
    if (posts.length == 0) {
      return Promise.reject("No results returned");
    } else {
      return posts;
    }
  })
  .catch(error => {
    return Promise.reject("Unable to retrieve published posts by category: ");
  });
}

function getCategories() {
  return Category.findAll()
    .then(categories => {
      if (categories.length == 0) {
        return Promise.reject("No results returned (categories)");
      }
      return categories;
    })
    .catch(error => {
      return Promise.reject("Unable to retrieve categories: ");
    });
}

function addPost(postData) {

  return new Promise((resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for (let prop in postData) {              
      if (postData[prop] === "") {
        postData[prop] = null;
      }
    }
    const postDate = new Date().toISOString().slice(0, 10);
    Post.create({
      body: postData.body,
      title: postData.title,
      postDate: postDate,
      category: parseInt(postData.category),
      featureImage: postData.featureImage,
      published: postData.published,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject("Unable to create post");
      });
  });
}

async function getPostsByCategory(category) {
  try {
    const posts = await getAllPosts();
    const filteredPosts = posts.filter((post) => post.category === category);

    if (filteredPosts.length === 0) {
      return Promise.reject("No results returned(category)");
    } else {
      const sortedPosts = filteredPosts.sort((a, b) => a.id - b.id);
      return sortedPosts;
    }
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function getPostsByMinDate(minDateStr) {
  try {
    const posts = await Post.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      },
      order: [['postDate', 'DESC']]     
    });

    if (posts.length === 0) {
     return Promise.reject("No results returned(minDate)");
    } else {
      return posts;
    }
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: {
          [Op.eq]: parseInt(id)
        }
      }
    }).then((posts) => {
      if (posts.length === 0) {
        reject("Post not found");
      } else {
        resolve(posts[0]);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    const data = {};
    for (const prop in categoryData) {
      if (categoryData[prop] === '') {
        data[prop] = null;
      } else {
        data[prop] = categoryData[prop];
      }
    }
    Category.create(data)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject('Unable to create category');
      });
  });
}

function deleteCategoryById(id) {
  return Category.destroy({ where: { id } })
    .then((deletedRows) => {
      if (deletedRows === 1) {
        return Promise.resolve();
      } else {
        return Promise.reject("Category not found");
      }
    })
    .catch((err) => {
      return Promise.reject("Unable to delete category");
    });
}

function deletePostById(id) {
  return Post.destroy({ where: { id } })
    .then((deletedRows) => {
      if (deletedRows === 1) {
        return Promise.resolve();
      } else {
        return Promise.reject("Post not found");
      }
    })
    .catch((err) => {
      return Promise.reject("Unable to delete post");
    });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  getPublishedPostsByCategory,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  addCategory,
  deleteCategoryById,
  deletePostById
};





