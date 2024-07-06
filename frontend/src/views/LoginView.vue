<template>
  <div class="login-container">
    <div class="login-box">
      <h3>SellCars</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="text" class="form-control mb-3" v-model="username" placeholder="Username" required />
        </div>
        <div class="form-group">
          <input type="password" class="form-control mb-4" v-model="password" placeholder="Password" required />
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
      <ToastComponent :message="errorMessage" type="alert" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import { login } from '@/services/authService';
import ToastComponent from '@/components/ToastComponent.vue';

export default defineComponent({
  name: 'LoginView',
  components: {
    ToastComponent
  },
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const handleLogin = async () => {
      try {
        errorMessage.value = '';
        const response = await login(username.value, password.value);
        if (response) {
          errorMessage.value = '';
          window.location.href = '/customers-page';
        } else {
          errorMessage.value = 'Invalid username or password';
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          errorMessage.value = 'Failed to login: ' + (error.response?.data.message || error.message);
        } else {
          errorMessage.value = 'Failed to login: ' + error;
        }
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
    padding: 2rem 6rem 4rem 6rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 100%;
    max-width: 500px;

    h3 {
      margin-bottom: 2rem;
      font-weight: 600;
    }

    button {
      float: right;
    }
  }
}
</style>
