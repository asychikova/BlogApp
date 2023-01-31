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

const fs = require("fs");
let posts = [];
let categories = [];

function initialize () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {reject("unable to read file");}
             else { posts = JSON.parse(data);
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {reject("unable to read file");}
                     else {
                        categories=JSON.parse(data);
                        resolve();}
                    });
                }
            });
        });
    }

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length==0) {
            reject("no results returned");
        } else {resolve(posts);}
    });
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
    const publishedPosts=posts.filter(post => post.published==true);
        if (publishedPosts.length==0) {
            reject("no results returned");
        } else {resolve(publishedPosts);}
    });
}

function getCategories () {
    return new Promise((resolve, reject) => {
        if (categories.length==0) {
            reject("no results returned");
        } else {resolve(categories);}
    });
}

module.exports = {initialize,getAllPosts,getPublishedPosts,getCategories} 


