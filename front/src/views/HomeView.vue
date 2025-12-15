<template>
  <div class="home">
    <h1>欢迎使用图片管理系统</h1>
    <p>这是一个基于Vue 3和Node.js的全栈图片管理系统。</p>
    <div class="features">
      <div class="feature-card">
        <h3>图片上传</h3>
        <p>支持多种格式的图片上传，自动处理缩略图生成。</p>
      </div>
      <div class="feature-card">
        <h3>标签管理</h3>
        <p>为图片添加标签，方便分类和检索。</p>
      </div>
      <div class="feature-card">
        <h3>图片编辑</h3>
        <p>在线裁剪、旋转图片，满足个性化需求。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #42b983;
  margin-bottom: 1rem;
}
</style>