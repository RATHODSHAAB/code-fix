const express    = require("express");
const userRoutes = require("./user"); // ✅ ESModule import that matches the `export default router`

const router = express.Router();

router.use("/user", userRoutes); // All user routes go under /api/users

export default router;
