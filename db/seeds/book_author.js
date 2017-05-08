
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE book_author RESTART IDENTITY;"
  )
  .then(() => {
    return knex('book_author').insert([
      {book_id: 1, author_id: 1},
      {book_id: 1, author_id: 5},
      {book_id: 1, author_id: 6},
      {book_id: 2, author_id: 2},
      {book_id: 3, author_id: 3},
      {book_id: 4, author_id: 4},
      {book_id: 5, author_id: 4},
      {book_id: 6, author_id: 4},
    ]);
  });
};
