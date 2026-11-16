import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  donorId: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100, index: true },
  phone: { type: String, required: true, trim: true, index: true },
  bloodGroup: { type: String, required: true, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"], index: true },
  membership: { type: String, enum: ["General","Silver","Gold","Platinum"], default: "General" },
  joinDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  photoUrl: { type: String, default: "" },
  signature: { type: String, default: "Authorized Signature" },
  status: { type: String, enum: ["Active","Inactive"], default: "Active", index: true },
  notes: { type: String, default: "", maxlength: 1000 }
}, { timestamps: true });

donorSchema.index({ name: "text", donorId: "text", phone: "text" });
donorSchema.index({ createdAt: -1 });
export default mongoose.model("Donor", donorSchema);
