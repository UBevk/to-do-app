<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'

const name = ref(''); // dobim glede na to kdo je log-inan
const newTask = ref('');
const tasks = ref([]); 

const backendUrl = 'https://to-do-app-4-u2e6.onrender.com';


const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = `/backgrounds/${url}`;
  });
};

const getTasks = async() => {
    const res = await fetch(backendUrl+'/tasks', {
        method: 'GET',
    })
    const data = await res.json()

    return data.sort((a, b) => a.order - b.order).map(item => ({
        _id: item._id,
        name: item.name,
        checked: item.checked,
        order: item.order
    })); 
    //tasks.value = data;
}

const addTask = async() => {
  if (newTask.value.trim()) { 
    const res = await fetch(backendUrl+'/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: newTask.value, checked: false }),
        headers: { 'content-type': 'application/json' }
    })

    const savedTask = await res.json();
    tasks.value = [...tasks.value, { _id: savedTask._id, name: savedTask.name, checked: savedTask.checked }];
    newTask.value = ''; // Clear input field
  } 
}

const deleteTaskFromDB = async(_id) => { 
    const res = await fetch(backendUrl+'/tasks/' + _id, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json'
        }
    })
    console.log(res);
}

const updateTaskOrder = async() => {
    await fetch(backendUrl+'/tasks/reorder', {
        method: 'PUT',
        body: JSON.stringify(tasks.value.map((task, index) => ({ _id: task._id, order: index }))),
        headers: { 'Content-Type': 'application/json' } 
    });
}

const updateTask = async (task) => {
    await fetch(backendUrl+'/tasks/' + task._id, {
        method: 'PUT',
        body: JSON.stringify({ checked: task.checked, name: task.name }),
        headers: { 'Content-Type': 'application/json' }
    });
}

const deleteTask = async (index) => {
    const taskID = tasks.value[index]._id;
    await deleteTaskFromDB(taskID);
    tasks.value.splice(index, 1);
}

const clearAll = async () => {
    const res = await fetch(backendUrl+'/tasks/deleteAll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
        tasks.value = [];
        newTask.value = '';
        console.log('All task cleared');
    } else {
        console.error('Failed to clear tasks');
    }

}

const router = useRouter();

const goToLoginPage = () => {
    router.push({name: 'Login'});
}

// Pridobimo trenutno ime dneva in datum
const today = ref(new Date());

// Sestavimo format "sreda, 16. oktober"
const formattedDate = computed(()=>`${today.value.toLocaleDateString('sl-SI', { weekday: 'long' })}, ${today.value.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}`);

const onDragStart = (evt) => {
  // Create an empty transparent image
  const img = new Image();
  img.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; // 1x1 transparent gif
  evt.originalEvent.dataTransfer.setDragImage(img, 0, 0);
};


const playSound = (src) => {
  const sound = new Audio(src);
  sound.volume = 0.1; // adjust if needed
  sound.play();
};


// BACKGROUND CHANGE
const backgrounds = [
  'praprot.jpg',
  'skiresort_wallpaper.jpg', 
  'sunset_wallpaper.jpg',
  'workspace_wallpaper.jpg'
];

const blackTextBackgrounds = ['skiresort_wallpaper.jpg'];
const whiteTextBackgrounds = ['praprot.jpg', 'sunset_wallpaper.jpg', 'workspace_wallpaper.jpg'];


const selectedBackground = ref('praprot.jpg'); // default wallpaper
const showMenu = ref(false);
const showMainMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const toggleMainMenu = () => {
    showMainMenu.value = !showMainMenu.value;
}

const changeBackground = async (background) => {
  selectedBackground.value = background;
  await fetch(backendUrl+'/user/wallpaper', {
    method: 'PUT',
    body: JSON.stringify({ wallpaper: background }),
    headers: { 'Content-Type': 'application/json' }
  });
};


const iconColorClass = computed(() => {
  return textColorClass.value === 'text-black' ? 'icon-black' : 'icon-white';
});


const loading = ref(true);

onMounted(async()=>{
    const data = await getTasks();
    tasks.value = data;

    // Fetch current wallpaper from backend
    try {
        const res = await fetch(backendUrl+'/user/wallpaper');
        if (res.ok) {
        const data = await res.json();
        selectedBackground.value = data.wallpaper;
        }
    } catch (error) {
        console.error('Failed to fetch wallpaper:', error);
    }

    loading.value = false;

    preloadImages(backgrounds);
})


const handleClickOutside = (event) => {
  const backgroundDropdown = document.querySelector('.background-dropdown');
  const mainMenuDropdown = document.querySelector('.menu-dropdown');
  const backgroundButton = document.querySelector('.background-menu-icon');
  const mainMenuButton = document.querySelector('.main-menu img'); // selector for main menu button

  // Close background menu if open and click is outside dropdown and button
  if (showMenu.value) {
    const clickedOutsideBackground = (!backgroundDropdown || !backgroundDropdown.contains(event.target)) &&
                                    (!backgroundButton || !backgroundButton.contains(event.target));
    if (clickedOutsideBackground) {
      showMenu.value = false;
    }
  }

  // Close main menu if open and click is outside dropdown and button
  if (showMainMenu.value) {
    const clickedOutsideMainMenu = (!mainMenuDropdown || !mainMenuDropdown.contains(event.target)) &&
                                  (!mainMenuButton || !mainMenuButton.contains(event.target));
    if (clickedOutsideMainMenu) {
      showMainMenu.value = false;
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});


const textColorClass = computed(() => {
  if (blackTextBackgrounds.includes(selectedBackground.value)) {
    return 'text-black';
  } else if (whiteTextBackgrounds.includes(selectedBackground.value)) {
    return 'text-white';
  } else {
    return 'text-white'; // fallback
  }
});

</script>

<template>
<div class="center-wrapper"
    :class="[textColorClass, { selected: true }]"
    :style="{ background: `url('/to-do-app/backgrounds/${selectedBackground}') no-repeat center center`, 
              backgroundSize: 'cover',}" >


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

  <draggable v-if="tasks.length > 0" v-model="tasks" tag="ul" group="tasks" class="tasks" itemKey="_id" @end="updateTaskOrder" @start="onDragStart">
    <template #item="{ element: task, index }">
      <div class="task-content task-item">
        <label class="custom-checkbox">
          <input 
            type="checkbox"
            :checked="task.checked"
            @change=" () => {
                task.checked = !task.checked; 
                updateTask(task); 
                if (task.checked) {
                    playSound('../../public/sounds/check.mp3');
                }
            }"/> 
          <span class="checkmark"></span>
        </label>

        <input 
            class="task-title" 
            v-model="task.name" 
            @input="updateTask(task)"
            :class="{ done: task.checked }" 
        />

        <span class="deleteTask" @click="deleteTask(index)">
          <img 
            class="deleteTask-icon" 
            :src="textColorClass === 'text-black' ? '../../public/icons/close-black.png' : '../../public/icons/close-white.png'" 
            alt="Delete" 
          />

        </span>
      </div>
    </template>
  </draggable>


<div class="background-menu">
  <img @click="toggleMenu" src="../../public/icons/gallery.png" alt="background-menu-icon" :class="[iconColorClass, 'background-menu-icon']" />

  <div v-if="showMenu" class="background-dropdown">
    <div 
      v-for="(background, index) in backgrounds" 
      :key="index" 
      class="background-thumb"
      :class="{ selected: selectedBackground === background }"
      :style="{ backgroundImage: `url('/to-do-app/backgrounds/${background}')` }"
      @click="changeBackground(background)"
    ></div>
  </div>
</div>


<div class="main-menu">
    <img @click="toggleMainMenu" src="../../public/icons/main-menu.png" alt="main-menu-icon" :class="[iconColorClass, 'main-menu-icon']">
    <div v-if="showMainMenu" class="menu-dropdown">
      
        <div><button id="loginBtn" @click="goToLoginPage">Log out</button></div>
    </div>
</div>


  <br>
</div>
</template>

<style scoped>

/*.center-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;  
    min-height: 100vh;
    background-color: black;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
}*/
.center-wrapper {
  min-height: 100dvh;
  min-width: 100vw;
  height: 100vh; /* fallback */
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

#title {
  padding-top: 30px;
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
  opacity: 1;
  background-color: transparent; /* Transparent background when unchecked */
  border-radius: 4px;
  transition: background-color 0.3s, border 0.8s;
}

.custom-checkbox input:checked + .checkmark {
  background-color: rgb(33, 243, 0); /* Checked color 
  background-color: rgb(30, 0, 255);*/
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
  font-size: 22px;                
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
  opacity: 0.6;
}

.tasks {
  color: white;
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
  font-size: 50px; /*neč ne nardi*/
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
  font-size: 22px;
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
  font-size: 16px;
  opacity: 0.6;
  transition: 0.3s;
}

#clearAll:hover {
  opacity: 1;
  transition: 0.3s;
  cursor: pointer;
}




.done {
  text-decoration: line-through;
  opacity: 0.6;
  transition: color 0.3s ease, opacity 0.3s ease;
}


.text-black {
  color: black !important;
}

.text-black input,
.text-black button,
.text-black .task-title,
.text-black label,
.text-black #title {
  color: black !important;
  /* Make sure inputs and labels also switch */
}
.text-black input::placeholder {
  color: black !important;
  opacity: 0.6;
}


.text-white {
  color: white !important;
}

.text-white input,
.text-white button,
.text-white .task-title,
.text-white label,
.text-white #title {
  color: white !important;
}
.text-white input::placeholder {
  color: white !important;
  opacity: 0.6;
}

.text-black .custom-checkbox .checkmark {
  border-color: rgba(0, 0, 0, 0.5); /* black-ish border when text is black */
}

.text-white .custom-checkbox .checkmark {
  border-color: rgba(255, 255, 255, 0.5); /* white-ish border when text is white */
}

.icon-black {
  filter: invert(0); /* no invert, normal color */
}

.icon-white {
  filter: invert(1); /* invert colors */
}

.background-menu-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;
  user-select: none;
}

.background-menu-icon:hover {
  transform: scale(1.2);
}

.background-menu {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    color: white;
    font-size: 15px;
}

.background-dropdown {
  display: flex;
  top: 0;          /* align vertically */
  right: 100%;  
  flex-direction: row;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 10px;
  position: absolute;
  z-index: 1001;
}

.background-thumb {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}

.background-thumb.selected {
  border: 2px solid white; /* white border for the selected thumbnail */
  box-sizing: border-box;  /* ensure border doesn't affect size */
}

.background-thumb:hover {
  transform: scale(1.05);
  border-color: white;
}

.main-menu {
  position: fixed;
  top: 20px;
  left: 20px; /* top-left corner */
  z-index: 1000;
  color: white;
  font-size: 15px;
}

.main-menu-icon {
  width: 30px;
  height: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;
  user-select: none;
}

.main-menu-icon:hover {
  transform: scale(1.2);
}

.menu-dropdown {
  position: absolute;
  top: 40px;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3); /* match background menu style */
  padding: 15px;
  border-radius: 10px;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px); /* stronger blur like background-menu */
  -webkit-backdrop-filter: blur(10px);
  z-index: 1001;
}

#loginBtn {
  width: 100%;
  font-size: 16px;        
  border-radius: 6px;    
  border: none;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 1002;
  padding: 5px;
}

#loginBtn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/*telefon*/
@media (max-width: 600px) {
  
  .center-wrapper h1 {
    font-size: 1.5rem;
  }

  .tasks, #newTask {
    width: 90vw; /* Use 90% of the viewport width */
    max-width: 600px; /* Limit max width */
  }

  .task-title, #newTaskField {
    width: 70vw; /* Allow input fields to shrink on smaller screens */
  }

  #title {
    font-size: 28px; /* Smaller font on mobile */
  }
}










.center-wrapper {
  border: 2px solid red;
}
.tasks {
  border: 2px solid blue;
}
.main-menu {
  border: 2px solid green;
}
.background-menu {
  border: 2px solid orange;
}


</style>
