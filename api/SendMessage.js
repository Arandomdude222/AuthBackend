const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function auth(req) {
  const token = req.headers.authorization?.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = async (req, res) => {
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

try {
    const user = auth(req);
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'No message' });

    await supabase.from('chat_messages').insert([
        {
            username: user.username,
            message
        }
    ]);

    res.json({ success: true });

} catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
}
};