const yup = require('yup');

// Hidden for simplicity

const validateLogin = yup.object({
  body: yup.object({
    email: yup.string().required(),
    password: yup.string().required(),
  }),
});

const validateRegister = yup.object().shape({
  body: yup.object({
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
  }),
});

module.exports = {
  validateLogin,
  validateRegister,
};
