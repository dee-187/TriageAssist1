import db from './server/db.js';
console.log(db.prepare('SELECT * FROM users').all());
