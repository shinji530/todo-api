import mongoose from "mongoose";

// mongoDB collection tasks의 구조
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 30,
      validate: {
        validator: function(title) {
          return title.split(' ').length > 1;
        },
        message: "Must contain at least 2 words",
      }
    },
    description: {
      type: String,
    },
    isComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { // option
    timestamps: true, // createdAt, updatedAt이 자동으로 생김
  }
);

// 작업 interface
const Task = mongoose.model('Task', TaskSchema); // Task -> tasks mongo collection

export default Task;