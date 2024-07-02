<template>
  <div class="login-container">
    <div class="login-box">
      <h1>SellCars</h1>
      <form @submit.prevent="handleLogin">
        <input type="text" v-model="username" placeholder="Username" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const handleLogin = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/users/login', {
          email: username.value,
          password: password.value,
        });
        // On successful login, save the token and redirect
        localStorage.setItem('token', response.data.token);
        errorMessage.value = '';
        // Redirect to the customers page
        window.location.href = '/customers';
      } catch (error) {
        errorMessage.value = 'Invalid username or password';
      }
    };

    return {
      username,
      password,
      errorMessage,
      handleLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 20px);
  background-color: #808080;
}

.login-box {
  background-color: #f0f0f0;
  padding: 1rem 7rem 6rem 7rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 20%;
  height: 30%;
}

.login-box h1 {
  margin-bottom: 20px;
}

.login-box input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-box button {
  width: 100%;
  padding: 10px;
  background-color: #0056b3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-box button:hover {
  background-color: #004494;
}

.login-box p {
  color: red;
  margin-top: 10px;
}
</style>
