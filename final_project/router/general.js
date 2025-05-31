const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some(user => user.username === username);
}

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
 
  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user." });
});


// Get the book list available in the shop (Async/Await)
public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(books), 100); // simulate delay
      });
    };
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving book list" });
  }
});


// Get book details based on ISBN (Promise)
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});


// Get book details based on author (Async/Await)
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  const getBooksByAuthor = () => {
    return new Promise((resolve) => {
      const results = [];
      for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          results.push({ isbn: key, ...books[key] });
        }
      }
      resolve(results);
    });
  };

  const result = await getBooksByAuthor();
  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get book details based on title (Promise)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve) => {
    const results = [];
    for (let key in books) {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        results.push({ isbn: key, ...books[key] });
      }
    }
    resolve(results);
  });

  getBooksByTitle
    .then(results => {
      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ message: "No books found with this title" });
      }
    });
});


// Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found to get reviews" });
  }
});
module.exports.general = public_users;
