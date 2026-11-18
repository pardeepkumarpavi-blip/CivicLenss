import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Department name cannot exceed 120 characters']
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Department code cannot exceed 10 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: 'Karachi'
    },
    jurisdiction: {
      type: String,
      trim: true,
      default: 'Karachi Metropolitan Area'
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

departmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
