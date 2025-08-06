const mongoose = require("mongoose");
const SubCategory = require("./SubCategory");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image:{
    type:String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subCategory: [
    {
      type: Schema.Types.ObjectId,
      ref: "subcategory",
    },
  ],
});


module.exports = mongoose.model("Category", categorySchema);
