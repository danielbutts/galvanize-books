
exports.up = function(knex, Promise) {
  return knex.schema.dropTable('book_author')
  .then(() => {
    return knex.schema.createTable('book_author', (table) => {
      table.increments();
      table.integer('author_id').notNullable();
      table.integer('book_id').notNullable();
      table.timestamps(true, true);
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('book_author')
  .then(() => {
    return knex.schema.createTable('book_author', (table) => {
      table.increments();
      table.string('author_id').notNullable();
      table.string('book_id').notNullable();
      table.timestamps(true, true);
    });
  });
};
