const yup = require('yup');

// Hidden for simplicity

const validateLogin = yup.object({
  body: yup.object({
    usernameOrEmail: yup.string().required(),
    password: yup.string().required(),
  }),
});
const validateRegister = yup.object().shape({
  body: yup.object({
    username: yup.string().required(),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
  }),
});
const validateCreateUser = yup.object({
  body: yup.object({
    email: yup.string().required(),
    userName: yup.string().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    userType: yup.string().required(),
    notification: yup.boolean().required(),
    status: yup.boolean().required(),
  }),
});
const validateUpdateUserById = yup.object({
  body: yup.object({
    email: yup.string().optional(),
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
    userType: yup.string().optional(),
    notification: yup.boolean().optional(),
    status: yup.boolean().optional(),
  }),
});
module.exports = {
  validateLogin,
  validateRegister,
};
