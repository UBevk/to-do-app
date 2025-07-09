<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const backendUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://to-do-app-4-u2e6.onrender.com';

const login = async (e) => {
  e.preventDefault();
  error.value = '';
  try {
    const res = await fetch(backendUrl + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username.value, password: password.value })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      router.push({ name: 'Main' });
    } else {
      error.value = data.error || 'Login failed';
    }
  } catch (err) {
    error.value = 'Network error';
  }
};
</script>

<template>
  <form @submit="login">
    <h1>LOG IN</h1>
    <input v-model="username" type="text" placeholder="Username" autocomplete="username" required /><br>
    <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required /><br>
    <button type="submit">Log in</button>
    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
  </form>

  <div style="margin-top: 10px;">
    <router-link :to="{ name: 'Register' }">Nimaš računa? Registriraj se</router-link>
  </div>
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