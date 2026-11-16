import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Customer from "../models/Customer.js";
import CardDesign from "../models/CardDesign.js";
import PrintOrder from "../models/PrintOrder.js";
import { customerProtect } from "../middleware/customerAuth.js";

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false });
const tokenFor = customer => jwt.sign({ id: customer._id, email: customer.email, name: customer.name, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicCustomer = customer => ({ id: customer._id, name: customer.name, email: customer.email });

router.post("/register", limiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");
    if (!name || !email || password.length < 8) return res.status(400).json({ message: "Name, valid email and password (minimum 8 characters) are required." });
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });
    const customer = await Customer.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(customer), customer: publicCustomer(customer) });
  } catch (error) { next(error); }
});

router.post("/login", limiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const customer = await Customer.findOne({ email });
    if (!customer || !(await bcrypt.compare(String(req.body.password || ""), customer.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    res.json({ token: tokenFor(customer), customer: publicCustomer(customer) });
  } catch (error) { next(error); }
});

router.get("/me", customerProtect, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer.id).select("name email");
    if (!customer) return res.status(404).json({ message: "Account not found." });
    res.json({ customer: publicCustomer(customer) });
  } catch (error) { next(error); }
});

router.get("/design", customerProtect, async (req, res, next) => {
  try { res.json({ design: await CardDesign.findOne({ customer: req.customer.id }) }); }
  catch (error) { next(error); }
});

router.put("/design", customerProtect, async (req, res, next) => {
  try {
    const allowed = ["institutionType","institutionName","studentName","studentId","classOrDepartment","session","phone","photoUrl","logoUrl","primaryColor","accentColor","title"];
    const data = {};
    for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key];
    const design = await CardDesign.findOneAndUpdate({ customer: req.customer.id }, { $set: data, $setOnInsert: { customer: req.customer.id } }, { new: true, upsert: true, runValidators: true });
    res.json({ design });
  } catch (error) { next(error); }
});

router.post("/orders", customerProtect, async (req, res, next) => {
  try {
    const design = await CardDesign.findOne({ customer: req.customer.id });
    if (!design || !design.institutionName || !design.studentName || !design.studentId) return res.status(400).json({ message: "Please save a complete card design before ordering." });
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5000) return res.status(400).json({ message: "Quantity must be between 1 and 5000." });
    const { deliveryName, phone, address, notes = "" } = req.body;
    if (!deliveryName || !phone || !address) return res.status(400).json({ message: "Delivery name, phone and address are required." });
    const order = await PrintOrder.create({ customer: req.customer.id, design: design._id, quantity, deliveryName, phone, address, notes });
    res.status(201).json({ order });
  } catch (error) { next(error); }
});

router.get("/orders", customerProtect, async (req, res, next) => {
  try {
    const orders = await PrintOrder.find({ customer: req.customer.id }).populate("design").sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (error) { next(error); }
});
export default router;
