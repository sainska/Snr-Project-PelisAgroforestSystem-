import express from "express";
import { stkPush } from "./mpesa/stkPush";
const router = express.Router();

router.post("/stkpush", async (req, res) => {
  // Accept phoneNumber (camelCase) from frontend, map to phone_number (snake_case) for DB
  const { phoneNumber, amount } = req.body;
  try {
    // Pass as object with snake_case keys if your stkPush expects that
    const response = await stkPush({ phone_number: phoneNumber, amount });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;