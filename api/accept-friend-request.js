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
    const { requestId } = req.body;

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('receiver_username', user.username);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
