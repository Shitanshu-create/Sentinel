const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_RULES = {
  username: 'Username must be 2-60 characters.',
  email: 'Email must be valid and 254 characters or less.',
  password: 'Password must be 8-128 characters.',
  name: 'Name must be 2-100 characters.'
};

function validateEmail(email) {
  if (!email) return 'Email is required';
  if (email.length > 254) return 'Email must be 254 characters or less';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be 128 characters or less';
  return null;
}

export function validateStep1PersonalDetails({ name, email, age, gender, phoneNo }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();

  if (!cleanName) return { message: 'Full Name is required' };
  if (cleanName.length < 2) return { message: 'Name must be at least 2 characters' };
  if (cleanName.length > 100) return { message: 'Name must be 100 characters or less' };

  const emailError = validateEmail(cleanEmail);
  if (emailError) return { message: emailError };

  if (age !== '' && age !== null && age !== undefined) {
    const numAge = Number(age);
    if (isNaN(numAge) || numAge < 18 || numAge > 65) {
      return { message: 'Age must be between 18 and 65' };
    }
  }

  return { values: { name: cleanName, email: cleanEmail, age: age ? Number(age) : null, gender: gender || 'prefer_not_to_say', phoneNo: (phoneNo || '').trim() } };
}

export function validateStep2LoginCredentials({ username, password }) {
  const cleanUsername = (username || '').trim();

  if (!cleanUsername) return { message: 'Username is required' };
  if (cleanUsername.length < 2) return { message: 'Username must be at least 2 characters' };
  if (cleanUsername.length > 60) return { message: 'Username must be 60 characters or less' };

  const passwordError = validatePassword(password);
  if (passwordError) return { message: passwordError };

  return { values: { username: cleanUsername, password } };
}

export const validateStep4LoginCredentials = validateStep2LoginCredentials;

export function validateStep3ServiceSelection(data = {}, role = 'personnel') {
  const values = { force: (data.force || '').trim() };

  if (role === 'personnel' || role === 'welfare_officer') {
    values.unit = (data.unit || '').trim();
  }
  if (role === 'personnel') {
    values.rank = (data.rank || '').trim();
    values.jobType = (data.jobType || '').trim();
  }

  return { values };
}

export function validateRegisterInput({ username, email, password }) {
  const values = {
    username: (username || '').trim(),
    email: (email || '').trim(),
    password
  };

  if (!values.username) return { message: 'Username is required' };
  if (values.username.length < 2) return { message: 'Username must be at least 2 characters' };

  const emailError = validateEmail(values.email);
  if (emailError) return { message: emailError };

  const passwordError = validatePassword(values.password);
  if (passwordError) return { message: passwordError };

  return { values };
}

export function validateLoginInput({ email, password }) {
  const values = {
    email: (email || '').trim(),
    password
  };

  const emailError = validateEmail(values.email);
  if (emailError) return { message: emailError };

  const passwordError = validatePassword(values.password);
  if (passwordError) return { message: passwordError };

  return { values };
}
