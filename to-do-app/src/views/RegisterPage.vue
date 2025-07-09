<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const success = ref('');
const backendUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://to-do-app-4-u2e6.onrender.com';

const register = async (e) => {
  e.preventDefault();
  error.value = '';
  success.value = '';
  try {
    const res = await fetch(backendUrl + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username.value.toLowerCase(), password: password.value })
    });
    const data = await res.json();
    if (res.ok) {
      success.value = 'Registracija uspešna! Zdaj se lahko prijaviš.';
      setTimeout(() => router.push({ name: 'Login' }), 1500); // Po 1.5s preusmeri na login
    } else {
      error.value = data.error || 'Registration failed';
    }
  } catch (err) {
    error.value = 'Network error';
  }
};
</script>

<template>
  <form @submit="register">
    <h1>REGISTER</h1>
    <input v-model="username" type="text" placeholder="Username" autocomplete="username" required /><br>
    <input v-model="password" type="password" placeholder="Password" autocomplete="new-password" required /><br>
    <button type="submit">Register</button>
    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
    <div v-if="success" style="color: green; margin-top: 10px;">{{ success }}</div>
    <div style="margin-top: 10px;">
      <router-link :to="{ name: 'Login' }">Nazaj na prijavo</router-link>
    </div>
  </form>
</template>

<style scoped>
h1 {
  color: #fff
}
input {
  padding: 5px;
  border-radius: 5px;
  background-color: #e8e8e8;
  font-size: 20px;
}
button {
  border-radius: 10px;
  font-size: 17px;
  padding: 6px;
  width: 100px;
  background-color: transparent;
  backdrop-filter: blur(10px);
  color: #fff;
}
</style>