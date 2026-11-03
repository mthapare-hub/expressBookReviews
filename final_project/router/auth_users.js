const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // A username is valid if it is a non-empty string not already taken
  return typeof username === 'string' && username.trim().length > 0 &&
    !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if username and password match a registered user
  return users.some((user) => user.username === username && user.password === password);
}

// Task 7: only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }

  // Sign a JWT and save it (with the username) in the session
  const accessToken = jwt.sign({data: username}, "access", {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};

  return res.status(200).json({message: "User successfully logged in"});
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }
  if (!review) {
    return res.status(400).json({message: "Review is required as a request query"});
  }

  // Same user posting again overwrites their review; other users get their own entry
  const alreadyReviewed = books[isbn].reviews[username] !== undefined;
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: alreadyReviewed
      ? "Review for ISBN " + isbn + " modified successfully"
      : "Review for ISBN " + isbn + " added successfully",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review (only the logged-in user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }
  if (books[isbn].reviews[username] === undefined) {
    return res.status(404).json({message: "No review by " + username + " found for ISBN " + isbn});
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({message: "Review for ISBN " + isbn + " deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;