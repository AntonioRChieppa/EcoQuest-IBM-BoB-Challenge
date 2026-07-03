const userService = require('../services/userService');

/**
 * POST /api/auth/register
 * Creates a new user account with a hashed password.
 */
async function register(req, res) {
  const { username, password, age, gender } = req.body;

  if (!username || !password || !age || !gender) {
    return res.status(400).json({ error: 'username, password, age e gender sono obbligatori.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }

  try {
    const user = await userService.register(username, password, Number(age), gender);
    return res.status(201).json({ user });
  } catch (err) {
    console.error('[UserController] register:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns their profile (no password_hash).
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username e password sono obbligatori.' });
  }

  try {
    const user = await userService.login(username, password);
    return res.json({ user });
  } catch (err) {
    console.error('[UserController] login:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
  }
}

module.exports = { register, login };
