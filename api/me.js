const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
        username: user.username
    });

} catch (err) {
    res.status(401).json({ error: "Invalid token" });
}
};