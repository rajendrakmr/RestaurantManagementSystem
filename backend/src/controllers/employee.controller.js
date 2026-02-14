const Employee = require("../models/employee.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create new employee
exports.createEmployee = async (req, res) => {
    try {
        const { name, mobile, password, role } = req.body; 
        const errors = {}; 
        if (!name) errors.name = "Name is required";
        if (!mobile) errors.mobile = "mobile is required";
        if (!password) errors.password = "Password is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({ errors });
        }

        const existing = await Employee.findOne({ mobile });
        if (existing) {
            return res.status(422).json({ errors: { mobile: "mobile already exists" } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = await Employee.create({
            name,
            mobile,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "Employee created", employeeId: employee._id });
    } catch (err) {
        res.status(500).json({ errors: { general: err.message } });
    }
};

// Login employee
exports.login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        const errors = {};
        if (!mobile) errors.mobile = "Mobile no is required";
        if (!password) errors.password = "Password is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({ errors });
        }
        const employee = await Employee.findOne({ mobile });
        if (!employee) {
            return res.status(422).json({ errors: { mobile: "Invalid mobile no entered" } });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(422).json({ errors: { password: "Invalid password entered." } });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: employee._id, role: employee.role, name: employee.name },
            "your_jwt_secret",
            { expiresIn: "1d" }
        );

        res.json({ token, employee: { id: employee._id, name: employee.name, role: employee.role } });
    } catch (err) {
        res.status(500).json({ errors: { general: err.message } });
    }
};
