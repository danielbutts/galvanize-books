const express = require('express');
const knex = require('../db/connection');

const router = express.Router();

function assembleBookObjects(results) {
  const books = {};
  results.forEach((book) => {
    const { book_id, title, description, genre, book_img } = book;
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
  return books;
}

function getBooks(id) {
  let query = knex.select('books.id as book_id', 'title', 'genre', 'description',
  'books.image_url as book_img', 'authors.id as author_id', 'first_name', 'last_name')
  .from('books')
  .innerJoin('book_author', 'book_id', 'books.id')
  .innerJoin('authors', 'author_id', 'authors.id');
  if (id !== undefined) {
    query = query.where({ 'books.id': id });
  }
  return query;
}

router.get('/', (req, res, next) => {
  getBooks().then((results) => {
    const books = assembleBookObjects(results);
    res.render('books', { books });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/edit/:id', (req, res, next) => {
  // TODO get current authors and set selected in form
  const id = req.params.id;
  getBooks(id).then((results) => {
    knex('authors').distinct('id', 'first_name', 'last_name')
    .then((authors) => {
      const books = assembleBookObjects(results);
      res.render('edit-book', { book: books[id], authors, isEdit: true });
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/delete/:id', (req, res, next) => {
  // TODO get current authors and set selected in form
  const id = req.params.id;
  getBooks(id).then((results) => {
    knex('authors').distinct('id', 'first_name', 'last_name')
    .then((authors) => {
      const books = assembleBookObjects(results);
      res.render('book-detail', { book: books[id], authors, isDelete: true });
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/new', (req, res) => {
  knex('authors').distinct('id', 'first_name', 'last_name')
  .then((authors) => {
    res.render('edit-book', { authors });
  });
});

function validateForm(fields) {
  const { title, description, genre, imageUrl, authors } = fields;
  const messages = [];

  if (title === undefined || title.length === 0) {
    messages.push('Title cannot be empty.');
  }
  if (description === undefined || description.length === 0) {
    messages.push('Description cannot be empty.');
  }
  if (genre === undefined || genre.length === 0) {
    messages.push('Genre cannot be empty.');
  }
  if (imageUrl === undefined || imageUrl.length === 0) {
    messages.push('You must provide a link to an image.');
  }
  if (authors === undefined || authors.length === 0) {
    messages.push('You must select at least one author.');
  }
  return messages;
}

router.post('/', (req, res, next) => {
  const { title, description, genre, imageUrl, authors } = req.body;
  const messages = validateForm(req.body);

  if (messages.length > 0) {
    knex('authors').distinct('id', 'first_name', 'last_name')
    .then((result) => {
      res.render('edit-book', { authors: result, messages, book: req.body });
    });
  } else {
    knex('books').insert({ title, description, genre, image_url: imageUrl }).returning('*')
    .then((books) => {
      const id = books[0].id;
      const bookAuthors = [];
      if (Array.isArray(authors)) {
        authors.forEach((author) => {
          bookAuthors.push({ book_id: id, author_id: author });
        });
      } else {
        bookAuthors.push({ book_id: id, author_id: authors });
      }
      knex('book_author').insert(bookAuthors)
      .then(() => {
        res.redirect('books');
      });
    })
    .catch((err) => {
      next(err);
    });
  }
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, description, genre, imageUrl, authors } = req.body;
  const messages = validateForm(req.body);

  if (messages.length > 0) {
    knex('authors').distinct('id', 'first_name', 'last_name')
    .then((result) => {
      req.body.id = id;
      res.render('edit-book', { authors: result, messages, book: req.body });
    });
  } else {
    knex('books').update({ title, description, genre, image_url: imageUrl })
    .where({ id })
    .returning('*')
    .then(() => {
      knex('book_author').delete().where({ book_id: id })
      .then(() => {
        const bookAuthors = [];
        if (Array.isArray(authors)) {
          authors.forEach((author) => {
            bookAuthors.push({ book_id: id, author_id: author });
          });
        } else {
          bookAuthors.push({ book_id: id, author_id: authors });
        }
        knex('book_author').insert(bookAuthors)
        .then(() => {
          res.redirect('/books');
        });
      });
    })
    .catch((err) => {
      next(err);
    });
  }
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  getBooks(id).then((results) => {
    const books = assembleBookObjects(results);
    res.render('book-detail', { book: books[id] });
  })
  .catch((err) => {
    next(err);
  });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('books').where({ id }).delete()
  .then(() => {
    res.send({ message: `successfully deleted book id ${id}` });
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
