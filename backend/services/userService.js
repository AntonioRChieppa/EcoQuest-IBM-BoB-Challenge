const bcrypt = require('bcryptjs');
const User   = require('../models/User');

const SALT_ROUNDS = 10;

/**
 * Registers a new user. Throws if the username is already taken.
 * Returns the user object without password_hash.
 */
async function register(username, password, age, gender) {
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    throw Object.assign(new Error('Username già in uso.'), { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, password_hash, age, gender });

  return sanitize(user);
}

/**
 * Logs in a user. Throws if credentials are invalid.
 * Returns the user object without password_hash.
 */
async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw Object.assign(new Error('Credenziali non valide.'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Credenziali non valide.'), { status: 401 });
  }

  return sanitize(user);
}

/**
 * Strips password_hash before sending the user to the client.
 */
function sanitize(user) {
  const obj = user.toJSON();
  delete obj.password_hash;
  return obj;
}

module.exports = { register, login };
