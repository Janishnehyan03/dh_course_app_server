const APIFeatures = require("../utils/API_Features");
const AppError = require("../utils/AppError");

exports.getAllItems = async (Model, reqQuery, populateFields, sort) => {
  try {
    let query = Model.find({ deleted: false });
    if (reqQuery) {
      query = Model.find({ ...reqQuery, });
    }

    if (populateFields) {
      const fields = populateFields.split(",");
      fields.forEach((field) => {
        query = query.populate(field);
      });
    }

    if (sort) {
      const sortBy = sort.split(":")[0];
      const sortOrder = sort.split(":")[1];
      query = query.sort({ [sortBy]: sortOrder });
    } else {
      query = query.sort({ createdAt: "desc" });
    }

    const items = await query.exec();
    return items;
  } catch (err) {
    return new AppError("Items not found", 400);
  }
};

exports.getItemById = async (Model, id) => {
  try {
    const item = await Model.findById(id);
    if (!item) {
      return new AppError("Item not found", 400);
    }
    return item;
  } catch (err) {
    return new AppError("Error occured", 400);
  }
};
exports.getItemSlug = async (Model, slug, populateFields,selectField) => {
  try {
    let query = Model.findOne({ slug }).select(selectField)
    if (populateFields) {
      const fields = populateFields.split(",");
      fields.forEach((field) => {
        query = query.populate(field)
      });
    }
    const item = await query.exec();
    if (!item) {
      throw new AppError("Item not found", 404);
    }
    return item;
  } catch (err) {
    console.error(err.message);
    throw new AppError("Error retrieving item from database", 500);
  }
};

exports.setDeleteStatus = async (Model, id) => {
  try {
    let item = await Model.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    return item;
  } catch (error) {
    throw new AppError("Error retrieving item from database", 500);
  }
};
