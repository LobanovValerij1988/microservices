import express from "express";
import { currentUser } from "@ticketsproj/services";

const router = express.Router();

router.get("/api/users/current-user", currentUser, (req, res) => {
  res.status(200).json({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
