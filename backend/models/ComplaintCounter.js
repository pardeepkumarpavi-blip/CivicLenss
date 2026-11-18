import mongoose from 'mongoose';

const complaintCounterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  sequenceValue: {
    type: Number,
    default: 0
  }
});

complaintCounterSchema.statics.getNextSequence = async function (year) {
  const currentYear = year || new Date().getFullYear();
  const counter = await this.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  const paddedSeq = String(counter.sequenceValue).padStart(5, '0');
  return `CL-${currentYear}-${paddedSeq}`;
};

const ComplaintCounter = mongoose.model('ComplaintCounter', complaintCounterSchema);
export default ComplaintCounter;
