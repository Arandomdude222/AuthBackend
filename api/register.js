const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('users')
      .insert([{ username, password_hash: hashedPassword }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (username exists)
        return res.status(400).json({ error: 'Username already taken' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
