const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function auth(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = async (req, res) => {
  try {
    const user = auth(req);
    const { action } = req.body;

    if (req.method === 'GET') {
      // get-friends
      const { data, error } = await supabase.from('friends').select('user2_username').eq('user1_username', user.username);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data.map(f => f.user2_username));
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    switch (action) {
      case 'send-request': {
        const { receiverUsername } = req.body;
        if (user.username === receiverUsername) return res.status(400).json({ error: 'Cannot send request to yourself' });
        const { error } = await supabase.from('friend_requests').insert({ sender_username: user.username, receiver_username: receiverUsername, status: 'pending' });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ message: 'Request sent' });
      }
      case 'get-requests': {
        const { data, error } = await supabase.from('friend_requests').select('id, sender_username').eq('receiver_username', user.username).eq('status', 'pending');
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
      }
      case 'accept-request': {
        const { requestId } = req.body;
        const { data: request } = await supabase.from('friend_requests').select('sender_username').eq('id', requestId).single();
        await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
        await supabase.from('friends').insert([{ user1_username: user.username, user2_username: request.sender_username }, { user1_username: request.sender_username, user2_username: user.username }]);
        return res.status(200).json({ message: 'Accepted' });
      }
      case 'remove-friend': {
        const { friendUsername } = req.body;
        await supabase.from('friends').delete().or(`and(user1_username.eq.${user.username},user2_username.eq.${friendUsername}),and(user1_username.eq.${friendUsername},user2_username.eq.${user.username})`);
        return res.status(200).json({ message: 'Removed' });
      }
      case 'search-players': {
        const { username } = req.body;
        const { data, error } = await supabase.from('users').select('username').eq('username', username).single();
        if (error || !data) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ username: data.username });
      }
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
