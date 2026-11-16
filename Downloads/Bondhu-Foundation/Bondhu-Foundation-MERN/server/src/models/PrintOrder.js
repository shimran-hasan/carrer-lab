import mongoose from "mongoose";
const printOrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
  design: { type: mongoose.Schema.Types.ObjectId, ref: "CardDesign", required: true },
  quantity: { type: Number, required: true, min: 1, max: 5000 },
  deliveryName: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, maxlength: 30 },
  address: { type: String, required: true, maxlength: 500 },
  notes: { type: String, default: "", maxlength: 1000 },
  status: { type: String, enum: ["Pending","Approved","Printing","Shipped","Delivered","Cancelled"], default: "Pending", index: true }
}, { timestamps: true });
export default mongoose.model("PrintOrder", printOrderSchema);
