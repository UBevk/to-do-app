<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'

const name = ref(''); // dobim glede na to kdo je log-inan
const newTask = ref('');
const tasks = ref([]); 

const backendUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://to-do-app-4-u2e6.onrender.com';

/*
const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = `/backgrounds/${url}`;
  });
};*/
const preloadImages = (imageUrls) => {
  if (!Array.isArray(imageUrls.value)) {
    console.error('Expected imageUrls.value to be an array, but got:', imageUrls.value);
    return;
  }
  imageUrls.value.forEach(url => {
    const img = new Image();
    img.src = `/to-do-app/backgrounds/${url}`;
  });
};


const getTasks = async() => {
    const date = today.value.toISOString().slice(0, 10);

    const res = await fetch(`${backendUrl}/tasks?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })

    const data = await res.json()

    return data.sort((a, b) => a.order - b.order).map(item => ({
        _id: item._id,
        name: item.name,
        checked: item.checked,
        order: item.order,
        date: item.date
    })); 
    //tasks.value = data;
}

const addTask = async() => {
  if (newTask.value.trim()) { 
    const date = today.value.toISOString().slice(0, 10);

    const res = await fetch(backendUrl+'/tasks', {
        method: 'POST',
        body: JSON.stringify({ 
          name: newTask.value, 
          checked: false,
          date 
        }),
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })

    const savedTask = await res.json();

    tasks.value = [
        ...tasks.value, 
        { 
          _id: savedTask._id, 
          name: savedTask.name, 
          checked: savedTask.checked,
          date: savedTask.date
        }];
    newTask.value = ''; // Clear input field
  } 
}

const deleteTaskFromDB = async(_id) => { 
    const res = await fetch(backendUrl+'/tasks/' + _id, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    console.log(res);
}

const updateTaskOrder = async() => {
    await fetch(backendUrl+'/tasks/reorder', {
        method: 'PUT',
        body: JSON.stringify(tasks.value.map((task, index) => ({ _id: task._id, order: index }))),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
}

const updateTask = async (task) => {
    await fetch(backendUrl+'/tasks/' + task._id, {
        method: 'PUT',
        body: JSON.stringify({ checked: task.checked, name: task.name }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
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

/*
const goToLoginPage = () => {
    router.push({name: 'Login'});
} */

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
const backgrounds = ref([
  'praprot.jpg',
  'skiresort_wallpaper.jpg', 
  'sunset_wallpaper.jpg',
  'workspace_wallpaper.jpg'
]);

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

// SPREMEMBA OZADJA

const changeBackground = async (background) => {
  selectedBackground.value = background;
  await fetch(backendUrl+'/user/wallpaper', {
    method: 'PUT',
    body: JSON.stringify({ wallpaper: background }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
};


const iconColorClass = computed(() => {
  return textColorClass.value === 'text-black' ? 'icon-black' : 'icon-white';
});


const loading = ref(true);

onMounted(async()=>{
    const data = await getTasks();
    tasks.value = data;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push({ name: 'Login' });
      return;
    }

    // Fetch current wallpaper from backend
    try {
        const res = await fetch(backendUrl + '/user/wallpaper', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
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

// add background button
const bgFileInput = ref(null)
const bgFileName = ref('')

const triggerFileInput = () => {
    bgFileInput.value.click()
}

const handleBgFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    bgFileName.value = file.name;

    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(backendUrl + '/upload-background', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();

      // Add new filename to backgrounds array
      backgrounds.value.push(data.filename);

      // Select newly uploaded background (backend serves at /backgrounds/filename)
      selectedBackground.value = data.filename;

      // Optionally, update user wallpaper on backend
      await fetch(backendUrl + '/user/wallpaper', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ wallpaper: data.filename })
      });

    } catch (err) {
      console.error(err);
      alert('Failed to upload background image.');
    }
  }
}

const backgroundUrl = computed(() => {
  if (selectedBackground.value.startsWith('http')) {
    return selectedBackground.value;
  }
  return `/to-do-app/backgrounds/${selectedBackground.value}`;
});

// LOGOUT
const logout = () => {
  localStorage.removeItem('token');
  router.push({ name: 'Login' });
};


// SPREMEMBA PLANIRANEGA DNEVA

// Pridobimo trenutno ime dneva in datum
const today = ref(new Date());

// Sestavimo format "sreda, 16. oktober"
const formattedDate = computed(()=>
    `${today.value.toLocaleDateString('sl-SI', { weekday: 'long' })}, ${today.value.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}`
);

const formattedDayBefore = computed( () => {
    return formattedDateWithOffset(today.value, -1);
});

const formattedDayAfter = computed( () => {
    return formattedDateWithOffset(today.value, 1);
});

function formattedDateWithOffset(baseDate, offsetDays) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offsetDays);
    return `${date.toLocaleDateString('sl-SI', { weekday: 'short' })}, ${date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}`;
} 

//const plannedDate = ref(new Date());

const handleDayChange = async (offset) => {
    today.value = new Date(today.value.setDate(today.value.getDate() + offset));

    tasks.value = [];
    const data = await getTasks();
    tasks.value = data;
}

</script>

<template>
<div class="center-wrapper"
    :class="[textColorClass, { selected: true }]"
    :style="{ background: `url('${backgroundUrl}') no-repeat center center`, backgroundSize: 'cover',}" >


  <div id="day-slider"> 
    <div id="day-before"><span id="day-before-text" @click="handleDayChange(-1)">{{ formattedDayBefore }}</span></div>
    <span id="title">{{ formattedDate }}</span><br>
    <div id="day-after"><span id="day-after-text" @click="handleDayChange(1)">{{ formattedDayAfter }}</span></div>
  </div>

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
                    playSound('/to-do-app/sounds/check.mp3');
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
            :src="textColorClass === 'text-black' ? '/to-do-app/icons/close-black.png' : '/to-do-app/icons/close-white.png'" 
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
      @click="changeBackground(background)">
    </div>

    <input type="file" ref="bgFileInput" class="hidden" @change="handleBgFileChange" accept="image/*" 
            style="opacity: 0; position: absolute; width: 0; height: 0;"/>

    <button id="addBackground">
        <img @click="triggerFileInput" src="../../public/icons/add.png" width="40" />
    </button>
  </div>
</div>


<div class="main-menu">
    <img @click="toggleMainMenu" src="../../public/icons/main-menu.png" alt="main-menu-icon" :class="[iconColorClass, 'main-menu-icon']">
    <transition name="menu-fade">
        <div v-if="showMainMenu" class="menu-dropdown">
            <div id="options">
                <a class="option" href="#">Option 1</a>
                <a class="option" href="#">Option 2</a>
            </div>
            <div><button id="loginBtn" @click="logout">Log out</button></div>
        </div>
    </transition>
</div>


  <br>
</div>
</template>

<style scoped>
  @import '../assets/styles/MainPage.css';
</style>