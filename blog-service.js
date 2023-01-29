const fs = require("fs");
const express = require('express')
const app = express()
let posts = [];
let categories = [];

app.get('/blog', (req, res) => {
    blogService.getAllPosts()
        .then((posts) => {
            res.json(posts);
        })
        .catch((err) => {
            res.json({error: err});
        });
});

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                posts = JSON.parse(data);
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }
    });
}

const getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        const publishedPosts = posts.filter(post => post.published === true);
        if (publishedPosts.length === 0) {
            reject("no results returned");
        } else {
            resolve(publishedPosts);
        }
    });
}

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("no results returned");
        } else {
            resolve(categories);
        }
    });
}

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getCategories
}




