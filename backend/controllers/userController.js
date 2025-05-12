import { users } from '../users.js';

export const getAllUsers = (req, res) => {
  try {
    const usernames = users.map(user => user.username);
    res.json(usernames);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
