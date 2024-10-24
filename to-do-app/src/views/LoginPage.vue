<script setup>
import { useRouter } from 'vue-router'; 

const router = useRouter();

const main = () => {
    router.push({ name: 'Main'})
}

</script>

<template>
    <form>
        <h1>LOG IN</h1>
        <input type="text" placeholder="Username"><br>
        <input type="password" placeholder="Password"><br>
        <button @click="main">Log in</button>
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
    backdrop-filter: blur(10px); /* Blur effect */
    color: #fff;
}
</style>