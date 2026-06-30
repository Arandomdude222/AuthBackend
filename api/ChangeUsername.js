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
    const { newUsername } = req.body;

    const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('username', user.username);

    if (error) return res.status(400).json({ error });

    const token = jwt.sign(
        { username: newUsername },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
        session: {
            access_token: token,
            username: newUsername
        }
    });

} catch {
    res.status(401).json({ error: 'Unauthorized' });
}
};