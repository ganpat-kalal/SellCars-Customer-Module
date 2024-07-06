<template>
  <div class="login-container">
    <div class="login-box">
      <h2>SellCars</h2>
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
import { login } from '@/services/authService';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const handleLogin = async () => {
      try {
        const response = await login(username.value, password.value);
        if (response) {
          errorMessage.value = '';
          window.location.href = '/customers-page';
        } else {
          errorMessage.value = 'Invalid username or password';
        }
      } catch (error) {
        errorMessage.value = 'Something went wrong. Please try again later.';
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
  height: 100vh;
  background-color: #808080;

  .login-box {
    background-color: #f0f0f0;
    padding: 2rem 7rem 6rem 7rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 20%;
    height: 30%;

    h2 {
      margin-bottom: 2rem;
    }

    input {
      display: block;
      width: -webkit-fill-available;
      padding: 10px;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      width: 80px;
      padding: 10px;
      margin-top: 5px;
      background-color: #0056b3;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      float: right;
    }

    button:hover {
      background-color: #004494;
    }

    p {
      color: red;
      margin-top: 10px;
    }
  }
}
</style>
