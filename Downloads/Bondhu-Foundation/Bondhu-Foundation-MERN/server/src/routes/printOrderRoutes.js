import { Router } from "express";
import PrintOrder from "../models/PrintOrder.js";
const router = Router();
const statuses = ["Pending","Approved","Printing","Shipped","Delivered","Cancelled"];
router.get("/", async (_req, res, next) => {
  try { const orders = await PrintOrder.find().populate("customer", "name email").populate("design").sort({ createdAt: -1 }).lean(); res.json({ orders }); }
  catch (error) { next(error); }
});
router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    const order = await PrintOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate("customer", "name email").populate("design");
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (error) { next(error); }
});
export default router;
