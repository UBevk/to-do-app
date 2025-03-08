<script setup>
import { ref, computed, onMounted } from 'vue';
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'

const name = ref(''); // dobim glede na to kdo je log-inan
const newTask = ref('');
const tasks = ref([]); 

const getTasks = async() => {
    const res = await fetch('http://localhost:8080/tasks', {
        method: 'GET',
    })
    const data = await res.json()
    return data.map(item => ({name: item.name, checked: item.checked}));
}

const addTaskToDB = async(name, checked) => { 
    const body = JSON.stringify({name, checked}) 
    console.log("body: " + body);
    const res = await fetch('http://localhost:8080/tasks', {
        method: 'POST',
        body,
        headers: {
            'content-type': 'application/json'
        }
    })
    console.log(res);
 }

const addTask = async() => {
 // const task = newTask.value.trim();
  console.log("žž:  " + {name: newTask.value, checked: false});
  if (newTask.value) { 
    //tasks.value.push({name: task, checked: false});

    tasks.value = [...tasks.value, {name: newTask.value, checked: false}];
    await addTaskToDB(newTask.value, false);
    newTask.value = ''; // Cleara input field
  }
}

// FIX!!!
const deleteTaskFromDB = async(taskID) => { 
    const res = await fetch('http://localhost:8080/tasks/' + taskID, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json'
        }
    })
    console.log(res);
}

const deleteTask = (index) => {
    tasks.value.splice(index, 1);
}

const clearAll = () => {
    tasks.value = [];
    newTask.value = '';
}

const toggleCheckbox = (index) => {
    tasks.value[index].checked = !tasks.value[index].checked;
}

const router = useRouter();

const goToLoginPage = () => {
    router.push({name: 'Login'});
}

// Pridobimo trenutno ime dneva in datum
const today = ref(new Date());

// Sestavimo format "sreda, 16. oktober"
const formattedDate = computed(()=>`${today.value.toLocaleDateString('sl-SI', { weekday: 'long' })}, ${today.value.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}`);

onMounted(async()=>{
    const data = await getTasks();
    tasks.value = data;
})

</script>

<template>
  <h1 id="title">{{ formattedDate }}</h1><br>

  <form @submit.prevent="addTask">
    <div id="newTask">
      <input 
        id="newTaskField" 
        placeholder="New task..." 
        spellcheck="false" 
        type="text" 
        name="newTask" 
        v-model="newTask" 
        autocomplete="off">
      <input hidden type="submit" value="Add Task">
      <button id="clearAll" type="button" @click="clearAll">Clear all</button>
    </div>
  </form><br>

  <draggable v-if="tasks.length > 0" v-model="tasks" tag="ul" group="tasks" class="tasks">
    <template #item="{ element: task, index }">
      <div class="task-content task-item">
        <label class="custom-checkbox">
          <input 
            type="checkbox"
            :checked="task.checked"
            @change="toggleCheckbox(index)" /> 
          <span class="checkmark"></span>
        </label>

        <input class="task-title" v-model="task.name"/>

        <span class="deleteTask" @click="deleteTask(index)">
          <img class="deleteTask-icon" src="../assets/close.png" alt="Delete">
        </span>
      </div>
    </template>
  </draggable>
  <br>
  <button id="loginBtn" @click="goToLoginPage">Log out</button>
</template>

<style scoped>
.tasks {
  color: white;
}

#title {
  color: white;
  font-size: 40px;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.custom-checkbox input {
  display: none; /* Hide the default checkbox */
}

.custom-checkbox .checkmark {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5); /* Opaque border when unchecked */
  opacity: 0.7;
  background-color: transparent; /* Transparent background when unchecked */
  border-radius: 4px;
  transition: background-color 0.3s, border 0.8s;
}

.custom-checkbox input:checked + .checkmark {
  background-color: rgb(33, 243, 0); /* Checked color */
  border: none;
}

.checkmark::after {
  content: "";
  position: absolute;
  display: none;
}

.custom-checkbox input:checked + .checkmark::after {
  display: block;
  left: 5.5px;
  top: 6px;
  width: 10px;
  height: 5px;
  border: solid white;
  border-width: 0 0 2px 2px;
  transform: rotate(-45deg);
}


.deleteTask {
  display: flex;                   
  justify-content: center;        
  align-items: center;               
  width: 25px;                      
  height: 25px;                      
  border-radius: 50%;              
  color: rgba(255, 255, 255, 0.373);                      
  font-size: 16px;                
  cursor: pointer;                   
  transition: background-color 0.3s, transform 0.3s;
  line-height: 1;
}

.deleteTask:hover {
  background-color: rgba(47, 47, 47, 0.373);
}

.deleteTask-icon {
  width: 12px;
  height: 12px;
  opacity: 0.3;
}

.tasks {
  background: rgba(255, 255, 255, 0.1); /* White background with 10% opacity */
  border-radius: 15px;
  padding: 20px;
  padding-top: 5px;
  padding-bottom: 5px;
  backdrop-filter: blur(10px); /* Blur effect */
  -webkit-backdrop-filter: blur(10px); /* Safari support */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional shadow for depth */
  width: 600px;
  text-align: center;
  color: white;
  font-size: 20px;
  margin-top: 20px;
}

.task-item {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  padding: 10px 0;
  border: black;
  border-width: 4px;
}

.task-content{
  display: flex;
  align-items: left;
  justify-content: space-between;
  width: 100%;
}

.task-title {
  background: transparent;
  padding-left: 15px;
  border: none;
  outline: none;
  color: white;
  height: 25px;
  width: 500px;
  font-size: 18px;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

#newTask {
  background: rgba(255, 255, 255, 0.1); /* White background with 10% opacity */
  border-radius: 15px;
  padding: 10px;
  backdrop-filter: blur(10px); /* Blur effect */
  -webkit-backdrop-filter: blur(10px); /* Safari support */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional shadow for depth */
  width: 600px;
  text-align: center;
  color: white;
  display: flex;
  justify-content: space-between;
}

#newTaskField {
  background: transparent;
  padding-left: 10px;
  padding-top: 5px;
  border: none;
  outline: none;
  color: white;
  height: 25px;
  width: 500px;
  font-size: 18px;
}

#clearAll {
  display: flex;
  background: transparent;
  border: none;
  color: white;
  padding: 5px 5px;
  text-align: center;
  font-size: 15px;
  opacity: 0.6;
  transition: 0.3s;
}

#clearAll:hover {
  opacity: 1;
  transition: 0.3s;
  cursor: pointer;
}

#loginBtn {
    border-radius: 10px;
    font-size: 17px;
    padding: 6px;
    width: 100px;
    background-color: transparent;
    backdrop-filter: blur(10px); /* Blur effect */
    color: #fff
}
</style>
