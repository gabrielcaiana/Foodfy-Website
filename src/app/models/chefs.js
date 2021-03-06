const db = require("../../config/db");
const { date } = require("../../lib/utils");

module.exports = {
  create(data, callback) {
    const query = `
    	INSERT INTO chefs (name, avatar_url, created_at)
  VALUES ($1, $2, $3)
  RETURNING id`;

    const values = [data.name, data.avatar_url, date(Date.now()).iso];

    db.query(query, values, (err, results) => {
      if (err) throw `Database error! ${err}`;

      callback(results.rows[0]);
    });
  },
  find(id, callback) {
    db.query(
      `SELECT chefs.*, count(recipes) AS total_recipes
        FROM chefs
      LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
      WHERE chefs.id = $1
      GROUP BY chefs.id 
      `,
      [id],
      (err, results) => {
        if (err) throw `Databse Error ${err}`;
        callback(results.rows[0]);
      }
    );
  },
  async chefRecipe(id) {
    let results = await db.query(
      `SELECT recipes.*
      FROM recipes
      LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
      WHERE chefs.id = $1
      ORDER BY recipes.created_at DESC
      `,
      [id]
    );
    return results.rows;
  },
  update(data, callback) {
    const query = `
    UPDATE chefs SET
      name= ($1),
      avatar_url= ($2),
      created_at= ($3)
    WHERE id= $4
    `;

    const values = [data.name, data.avatar_url, date(Date.now()).iso, data.id];

    db.query(query, values, (err, results) => {
      if (err) throw `Database error ${err}`;

      callback();
    });
  },
  delete(id, callback) {
    db.query(`DELETE FROM chefs WHERE id = $1`, [id], (err, results) => {
      if (err) throw `Database error ${err}`;

      callback();
    });
  },
};
