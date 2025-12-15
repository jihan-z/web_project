<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/gallery">图库</RouterLink>
        <RouterLink to="/upload">上传</RouterLink>
        <RouterLink to="/auth">登录</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

header {
  background-color: #f8f9fa;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
}

nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

nav a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a.router-link-exact-active {
  background-color: #42b983;
  color: white;
}

nav a:hover {
  background-color: #e9ecef;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>