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

    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('receiver_username', user.username);

    if (updateError) return res.status(400).json({ error: updateError.message });

    // Fetch the request to get sender username
    const { data: request } = await supabase
      .from('friend_requests')
      .select('sender_username')
      .eq('id', requestId)
      .single();

    // Create friendship record
    await supabase.from('friends').insert([
      { user1_username: user.username, user2_username: request.sender_username },
      { user1_username: request.sender_username, user2_username: user.username }
    ]);

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
