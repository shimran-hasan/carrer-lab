import Donor from "../models/Donor.js";

export async function generateDonorId() {
  const year = new Date().getFullYear();
  const prefix = `BF-${year}-`;
  const latest = await Donor.findOne({ donorId: new RegExp(`^${prefix}`) })
    .sort({ donorId: -1 }).select("donorId").lean();
  const lastNumber = latest ? Number(latest.donorId.split("-").at(-1)) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(5, "0")}`;
}
