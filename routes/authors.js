const express = require('express');
const knex = require('../db/connection');

const router = express.Router();

function assembleAuthorObjects(results) {
  const authors = {};
  results.forEach((author) => {
    const { author_id, first_name, last_name, biography, author_img } = author;
    if (authors[author.author_id] === undefined) {
      authors[author.author_id] = {
        id: author_id,
        firstName: first_name,
        lastName: last_name,
        biography,
        imageUrl: author_img,
      };
    }
    if (authors[author.author_id].books === undefined) {
      authors[author.author_id].books = [];
    }
    authors[author.author_id].books.push({
      id: author.book_id,
      title: author.title,
    });
  });
  return authors;
}

function getAuthors(id) {
  let query = knex.select('authors.id as author_id', 'first_name', 'last_name', 'authors.image_url as author_img', 'authors.biography', 'books.id as book_id', 'title')
  .from('authors')
  .innerJoin('book_author', 'author_id', 'authors.id')
  .innerJoin('books', 'book_id', 'books.id');
  if (id !== undefined) {
    query = query.where({ 'authors.id': id });
  }
  return query;
}

router.get('/', (req, res, next) => {
  getAuthors().then((results) => {
    const authors = assembleAuthorObjects(results);
    Object.values(authors).forEach((author) => {
      if (author.biography.length > 200) {
        author.biography = author.biography.substring(0, 200) + '...'; // eslint-disable-line
      }
    });
    res.render('authors', { authors });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/edit/:id', (req, res, next) => {
  // TODO get current books and set selected in form
  const id = req.params.id;
  getAuthors(id).then((results) => {
    knex('books').distinct('id', 'title')
    .then((books) => {
      const authors = assembleAuthorObjects(results);
      res.render('edit-author', { author: authors[id], books, isEdit: true });
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/delete/:id', (req, res, next) => {
  // TODO get current books and set selected in form
  const id = req.params.id;
  getAuthors(id).then((results) => {
    knex('books').distinct('id', 'title')
    .then((books) => {
      const authors = assembleAuthorObjects(results);
      res.render('author-detail', { author: authors[id], books, isDelete: true });
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/new', (req, res) => {
  knex('books').distinct('id', 'title')
  .then((books) => {
    res.render('edit-author', { books });
  });
});

function validateForm(fields) {
  const { firstName, lastName, imageUrl, biography } = fields;
  const messages = [];

  if (firstName === undefined || firstName.length === 0) {
    messages.push('First name cannot be empty.');
  }
  if (lastName === undefined || lastName.length === 0) {
    messages.push('Last name cannot be empty.');
  }
  if (biography === undefined || biography.length === 0) {
    messages.push('Biography cannot be empty.');
  }
  if (imageUrl === undefined || imageUrl.length === 0) {
    messages.push('You must provide a link to an image.');
  }
  return messages;
}

// router.post('/', (req, res, next) => {
//   const { title, description, genre, imageUrl, authors } = req.body;
//   const messages = validateForm(req.body);
//
//   if (messages.length > 0) {
//     knex('authors').distinct('id', 'first_name', 'last_name')
//     .then((result) => {
//       res.render('edit-book', { authors: result, messages, book: req.body });
//     });
//   } else {
//     knex('books').insert({ title, description, genre, image_url: imageUrl }).returning('*')
//     .then((books) => {
//       const id = books[0].id;
//       const bookAuthors = [];
//       if (Array.isArray(authors)) {
//         authors.forEach((author) => {
//           bookAuthors.push({ book_id: id, author_id: author });
//         });
//       } else {
//         bookAuthors.push({ book_id: id, author_id: authors });
//       }
//       knex('book_author').insert(bookAuthors)
//       .then(() => {
//         res.redirect('books');
//       });
//     })
//     .catch((err) => {
//       next(err);
//     });
//   }
// });
//
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { firstName, lastName, imageUrl, biography } = req.body;
  const messages = validateForm(req.body);
  const books = req.body.books;
  if (books === undefined || books.length === 0) {
    messages.push('You must select at least one book.');
  }

  if (messages.length > 0) {
    knex('books').distinct('id', 'title')
    .then((result) => {
      req.body.id = id;
      res.render('edit-author', { authors: result, messages, book: req.body });
    });
  } else {
    knex('authors').update({ first_name: firstName, last_name: lastName, biography, image_url: imageUrl })
    .where({ id })
    .returning('*')
    .then(() => {
      // knex('book_author').delete().where({ book_id: id })
      // .then(() => {
      //   const bookAuthors = [];
      //   if (Array.isArray(books)) {
      //     books.forEach((book) => {
      //       bookAuthors.push({ book_id: id, author_id: author });
      //     });
      //   } else {
      //     bookAuthors.push({ book_id: id, author_id: authors });
      //   }
      //   knex('book_author').insert(bookAuthors)
      //   .then(() => {
      //     res.redirect('/books');
      //   });
      // });
    })
    .catch((err) => {
      next(err);
    });
  }
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  getAuthors(id).then((results) => {
    const authors = assembleAuthorObjects(results);
    res.render('author-detail', { author: authors[id] });
  })
  .catch((err) => {
    next(err);
  });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('authors').where({ id }).delete()
  .then(() => {
    res.send({ message: `successfully deleted author id ${id}` });
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
