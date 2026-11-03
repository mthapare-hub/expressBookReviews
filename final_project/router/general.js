const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(409).json({message: "Username already exists"});
  }

  users.push({username: username, password: password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({message: "Book not found for ISBN " + isbn});
 });
  
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  const matches = [];

  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matches.push({isbn: key, ...books[key]});
    }
  });

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({booksbyauthor: matches}, null, 4));
  }
  return res.status(404).json({message: "No books found for author " + author});
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const matches = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matches.push({isbn: key, ...books[key]});
    }
  });

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({booksbytitle: matches}, null, 4));
  }
  return res.status(404).json({message: "No books found with title " + title});
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found for ISBN " + isbn});
});

// ---------------------------------------------------------------------------
// Tasks 10-13: Axios clients using async-await.
// These call the server's own routes above, so the server must be running.
// ---------------------------------------------------------------------------
const BASE_URL = "http://localhost:5000";

// Task 10: Get the list of books available in the shop
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error("Error fetching book list:", error.message);
  }
};

// Task 11: Get book details based on ISBN
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
  }
};

// Task 12: Get book details based on author
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error.message);
  }
};

// Task 13: Get book details based on title
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error.message);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;