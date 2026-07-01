const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function auth(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token');

    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = async (req, res) => {
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

try {
    const user = auth(req);
    const { currentPassword, newPassword } = req.body;

    const { data } = await supabase
        .from('users')
        .select('password_hash')
        .eq('username', user.username)
        .single();

    const match = await bcrypt.compare(currentPassword, data.password_hash);
    if (!match) return res.status(401).json({ error: 'Wrong password' });

    const hash = await bcrypt.hash(newPassword, 10);

    await supabase
        .from('users')
        .update({ password_hash: hash })
        .eq('username', user.username);

    res.json({ message: 'Password updated' });

} catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
}
};