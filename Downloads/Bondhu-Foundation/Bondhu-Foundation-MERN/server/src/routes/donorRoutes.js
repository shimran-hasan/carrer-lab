import { Router } from "express";
import Donor from "../models/Donor.js";
import { generateDonorId } from "../utils/ids.js";

const router = Router();
const fields = ["donorId","name","phone","bloodGroup","membership","joinDate","expiryDate","photoUrl","signature","status","notes"];

function pick(input) {
  const result = {};
  for (const key of fields) if (input[key] !== undefined) result[key] = input[key];
  return result;
}

router.get("/stats", async (_req, res, next) => {
  try {
    const [total, active, inactive, groups] = await Promise.all([
      Donor.countDocuments(), Donor.countDocuments({ status: "Active" }),
      Donor.countDocuments({ status: "Inactive" }),
      Donor.aggregate([{ $group: { _id: "$bloodGroup", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ total, active, inactive, groups });
  } catch (error) { next(error); }
});

router.get("/next-id", async (_req, res, next) => {
  try { res.json({ donorId: await generateDonorId() }); }
  catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const search = String(req.query.search || "").trim().slice(0, 100);
    const bloodGroup = String(req.query.bloodGroup || "");
    const status = String(req.query.status || "");
    const filter = {};
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { donorId: { $regex: safe, $options: "i" } },
        { name: { $regex: safe, $options: "i" } },
        { phone: { $regex: safe, $options: "i" } }
      ];
    }
    if (["A+","A-","B+","B-","AB+","AB-","O+","O-"].includes(bloodGroup)) filter.bloodGroup = bloodGroup;
    if (["Active","Inactive"].includes(status)) filter.status = status;
    const [items, total] = await Promise.all([
      Donor.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Donor.countDocuments(filter)
    ]);
    res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.donorId) data.donorId = await generateDonorId();
    const donor = await Donor.create(data);
    res.status(201).json({ donor });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Donor ID already exists. Generate a new ID." });
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    res.json({ donor });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    res.json({ donor });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Donor ID already exists." });
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    res.json({ message: "Donor deleted." });
  } catch (error) { next(error); }
});

export default router;
