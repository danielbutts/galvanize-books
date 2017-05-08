
exports.up = function(knex, Promise) {
  return knex.schema.createTable('authors', (table) => {
    table.increments();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.text('biography').notNullable();
    table.text('image_url').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('authors');
};
