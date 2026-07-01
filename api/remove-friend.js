const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function auth(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = auth(req);
    const { friendUsername } = req.body;

    // Delete both directions of friendship
    await supabase.from('friends').delete().eq('user1_username', user.username).eq('user2_username', friendUsername);
    await supabase.from('friends').delete().eq('user1_username', friendUsername).eq('user2_username', user.username);

    res.status(200).json({ message: 'Friend removed' });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
