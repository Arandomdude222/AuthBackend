const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate secure JWT
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return structure expected by frontend
    res.status(200).json({ session: { access_token: token, username: username } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
