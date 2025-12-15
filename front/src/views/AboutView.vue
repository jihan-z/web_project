<template>
  <div class="about">
    <h1>关于我们</h1>
    <div class="content">
      <p>这是一个开源的图片管理系统，旨在帮助用户更好地组织和管理他们的图片资源。</p>
      
      <h2>功能特性</h2>
      <ul>
        <li>用户认证和权限管理</li>
        <li>图片上传和存储</li>
        <li>自动生成缩略图</li>
        <li>标签分类系统</li>
        <li>图片编辑工具</li>
        <li>响应式设计，支持多设备访问</li>
      </ul>
      
      <h2>技术栈</h2>
      <div class="tech-stack">
        <div class="tech-item">
          <h3>前端</h3>
          <p>Vue 3 + Vite + Element Plus</p>
        </div>
        <div class="tech-item">
          <h3>后端</h3>
          <p>Node.js + Express + MySQL</p>
        </div>
        <div class="tech-item">
          <h3>图像处理</h3>
          <p>Sharp.js</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.content {
  text-align: left;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tech-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.tech-item h3 {
  color: #42b983;
  margin-bottom: 1rem;
}
</style>