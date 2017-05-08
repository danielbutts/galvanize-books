
exports.up = function(knex, Promise) {
  return knex.schema.createTable('book_author', (table) => {
    table.increments();
    table.string('author_id').notNullable();
    table.string('book_id').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('book_author');
};
