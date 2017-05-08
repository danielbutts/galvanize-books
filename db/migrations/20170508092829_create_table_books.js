
exports.up = function(knex, Promise) {
  return knex.schema.createTable('books', (table) => {
    table.increments();
    table.string('title').notNullable();
    table.string('genre').notNullable();
    table.text('description').notNullable();
    table.text('image_url').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('books');
};
