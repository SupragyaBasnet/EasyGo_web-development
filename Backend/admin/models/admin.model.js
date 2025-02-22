const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, default: "admin" },
    email: { type: String, required: true, unique: true, default: "admin@easygo.com" },
    password: { type: String, required: true },
    date: { type: String, required: true }, // Store as YYYY-MM-DD string
  fare: { type: Number, required: true },
  distance: { type: Number, required: true },
  vehicleType: { type: String, required: true },
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT Token
adminSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Compare password
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

// Ensure default admin exists
(async () => {
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("EasyGo@123", 10);
        await Admin.create({
            username: "admin",
            email: "admin@easygo.com",
            password: hashedPassword,
        });
        console.log(" Default Admin Created");
    }
})();

module.exports = Admin;
