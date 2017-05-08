const express = require('express');
const knex = require('../db/connection');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex.select('books.id as book_id', 'title', 'genre', 'description',
  'books.image_url as book_img', 'authors.id as author_id', 'first_name', 'last_name')
  .from('books')
  .innerJoin('book_author', 'book_id', 'books.id')
  .innerJoin('authors', 'author_id', 'authors.id')
  .then((results) => {
    const books = {};
    results.forEach((book) => {
      const { book_id, title, description, genre, book_img } = book;
      // console.log(book_id, title, description, genre, book_img);
      if (books[book.book_id] === undefined) {
        books[book.book_id] = {
          id: book_id,
          title,
          description,
          genre,
          imageUrl: book_img,
        };
      }
      if (books[book.book_id].authors === undefined) {
        books[book.book_id].authors = [];
      }
      books[book.book_id].authors.push({
        id: book.author_id,
        firstName: book.first_name,
        lastName: book.last_name,
      });
    });
    res.render('books', { books });
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
