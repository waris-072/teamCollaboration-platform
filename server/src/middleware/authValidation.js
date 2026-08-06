import {
  NAME_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
} from "../utils/validator.js";

export const validateRegister = (req, res, next) => {
  let {
    name,
    email,
    password,
    confirmPassword,
    phone,
    address,
  } = req.body;

  // Trim inputs
  name = name?.trim();
  email = email?.trim().toLowerCase();
  phone = phone?.trim();
  address = address?.trim();

  // Update request body
  req.body.name = name;
  req.body.email = email;
  req.body.phone = phone;
  req.body.address = address;

  // Required fields
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  if (!NAME_REGEX.test(name)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid name.",
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  let { email, password } = req.body;

  email = email?.trim().toLowerCase();

  req.body.email = email;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  next();
};