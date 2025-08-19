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
    <div class="test">
    <div class="center-wrapper">
        <form @submit="login">
            <h1>LOG IN</h1>
            <input v-model="username" type="text" placeholder="Username" autocomplete="username" required />
            <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required />
            <button class="loginBtn" type="submit">Log in</button>

            <div v-if="error" style="color: red; font-size: 15px; margin-top: 15px;">{{ error }}</div>

            <div class="register-link">
                Don’t have an account?
                <router-link to="/register">Register</router-link>
            </div>
        </form>
    </div>
    </div>
</template>


<style scoped>

.center-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center; /* vertically center */
  align-items: center;
  min-height: 100vh;
  padding: 0 1rem;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
  background: url('../../public/backgrounds/praprot.jpg') center/cover no-repeat;
  background-attachment: fixed;
}

form {
  position: relative;
  width: 100%;
  max-width: 350px;
  padding: 2.5rem 2rem;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
}

form::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 5px;
  border-radius: 18px;
  z-index: -1;
}

h1 {
  color: #fff;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 1.8rem;
  text-align: center;
}

input {
  background: rgba(255, 255, 255, 0.12);
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  outline: none;
  color: #f0f0f0;
  font-size: 16px;
  width: 100%;
  transition: 
    background 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input:focus {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15), 0 0 0 2px #43cea2;
  border: 1px solid #43cea2;
}

button {
  margin-top: 16px;
  border-radius: 12px;
  font-size: 16px;
  padding: 12px 20px;
  width: 100%;
  max-width: 150px;
  background: linear-gradient(135deg, #3a9d80, #2e7d5e);
  color: #ffffff;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  outline: none;
  backdrop-filter: blur(6px);
}

button:hover,
button:focus {
  background: linear-gradient(135deg, #43cea2, #185a4f);
  box-shadow: 0 6px 20px rgba(67, 206, 162, 0.35),
              0 4px 12px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px) scale(1.05);
  filter: brightness(1.05) saturate(1.1);
}

.register-link {
  font-size: 14px;
  color: #e0e0e0;
  margin-top: 18px;
  text-align: center;
  opacity: 0.8;
  letter-spacing: 0.1px;
  transition: opacity 0.2s;
  width: 100%;
}

.register-link a {
  color: #43cea2;
  text-decoration: none;
  border-bottom: 1px solid #43cea2;
  opacity: 0.85;
  padding-bottom: 1px;
}

.register-link a:hover {
  color: #fff;
  border-bottom-color: #fff;
  opacity: 1;
}






/* Responsive tweaks */
@media (max-width: 600px) {
  h1 {
    font-size: 1.6rem;
  }

  input,
  button {
    font-size: 15px;
    padding: 12px;
  }

  form {
    border: none;
    background: none;
    box-shadow: none;
    backdrop-filter: none;
  }

  .center-wrapper {
    background: none; /* remove background from this element */
  }

  .center-wrapper::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('../../public/backgrounds/praprot.jpg') center/cover no-repeat fixed;
    filter: blur(15px);
    z-index: -1; /* behind content */
    pointer-events: none; /* allow clicks to pass through */
    transform: scale(1.05); /* optional: avoid sharp edges after blur */
  }
}   

</style>
