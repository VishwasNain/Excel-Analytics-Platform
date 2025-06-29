const axios = require('axios');
const fs = require('fs');

const registerAccount = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'vishwasnain',
      email: 'vishwasnain12@gmail.com',
      password: 'Vishwas@123'
    });

    console.log('Registration successful!');
    console.log('Response:', response.data);

    // Instead of localStorage, write token to a file
    fs.writeFileSync('auth.json', JSON.stringify({
      token: response.data.token,
      user: response.data.user
    }, null, 2));

    console.log('Auth data saved to auth.json');
    console.log('You can now access the dashboard at http://localhost:3000/dashboard');
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

registerAccount();
