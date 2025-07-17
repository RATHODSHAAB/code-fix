import express from "express";
import userRoutes from "./user"; // ✅ ESModule import that matches the `export default router`
import adminRoutes from "./admin"
const router = express.Router();


router.use("/user", userRoutes); // All user routes go under /api/users
router.use("/admin", adminRoutes);
export default router;


