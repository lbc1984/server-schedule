<template>
  <div id="app-root">
    <!-- HEADER: ẨN KHI Ở TRANG LOGIN -->
    <header
      v-if="$route.name !== 'Login'"
      class="main-header"
    >
      <h1>Scheduler</h1>
      <nav>
        <router-link
          to="/schedule"
          class="nav-btn"
          :class="{ active: $route.path === '/schedule' }"
        >
          📋 Thiết bị
        </router-link>

        <router-link
          to="/logout"
          class="nav-btn"
        >
          🔑 Logout
        </router-link>
      </nav>
    </header>

    <!-- CONTENT -->
    <main
      class="content-view"
      :class="{ 'no-padding': $route.name === 'Login' }"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
/* === ROOT FIX === */
html,
body,
#app,
#app-root {
  height: 100%;
  margin: 0;
  overflow: hidden; /* 🔥 DỨT ĐIỂM SCROLL */
}

/* === LAYOUT === */
#app-root {
  display: flex;
  flex-direction: column;
}

/* === HEADER === */
.main-header {
  flex-shrink: 0;
  background-color: #2c3e50;
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-header h1 {
  margin: 0;
  font-size: 1.4em;
}

/* === NAV === */
nav {
  display: flex;
  gap: 10px;
}

.nav-btn {
  color: #b3c0cf;
  text-decoration: none;
  padding: 8px 14px;
  border-bottom: 3px solid transparent;
  transition: all 0.25s ease;
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
  flex: 1;
  overflow: auto;
  /* padding: 20px; */
  background: #f5f6f8;
}

.content-view.no-padding {
  padding: 0 !important;
  overflow: hidden;
}
</style>
