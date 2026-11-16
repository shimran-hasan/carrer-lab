import mongoose from "mongoose";
const cardDesignSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
  institutionType: { type: String, enum: ["School","College","University"], default: "School" },
  institutionName: { type: String, default: "", maxlength: 140 },
  studentName: { type: String, default: "", maxlength: 100 },
  studentId: { type: String, default: "", maxlength: 50 },
  classOrDepartment: { type: String, default: "", maxlength: 100 },
  session: { type: String, default: "", maxlength: 40 },
  phone: { type: String, default: "", maxlength: 30 },
  photoUrl: { type: String, default: "", maxlength: 1000 },
  logoUrl: { type: String, default: "", maxlength: 1000 },
  primaryColor: { type: String, default: "#14532d", match: /^#[0-9a-fA-F]{6}$/ },
  accentColor: { type: String, default: "#dc2626", match: /^#[0-9a-fA-F]{6}$/ },
  title: { type: String, default: "STUDENT ID CARD", maxlength: 50 }
}, { timestamps: true });
export default mongoose.model("CardDesign", cardDesignSchema);
