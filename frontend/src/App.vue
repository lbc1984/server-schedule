<template>
  <div id="app-container">
    <header class="main-header">
      <h1>Scheduler Admin</h1>
      <nav>
        <router-link
          to="/schedule"
          class="nav-btn"
          :class="{ active: $route.path === '/schedule' }"
        >
          📋 Xem Danh Sách Thiết Bị
        </router-link>
        <router-link
          to="/login"
          class="nav-btn"
          :class="{ active: $route.path === '/login' }"
        >
          🔑 Login
        </router-link>
      </nav>
    </header>

    <main class="content-view">
      <router-view v-slot="{ Component }">
          <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
#app-container {
  max-width: 1200px;
  margin: 0 auto;
}

.main-header {
  background-color: #2c3e50;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-header h1 {
  margin: 0;
  font-size: 1.5em;
}

nav {
  display: flex;
  gap: 10px;
}

.nav-btn {
  color: #b3c0cf;
  text-decoration: none;
  padding: 10px 15px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  color: white;
  background-color: #3f5469;
}

.nav-btn.active {
  color: white;
  border-bottom: 3px solid #4CAF50;
  background-color: #3f5469;
}

.content-view {
  padding: 20px;
}
</style>
