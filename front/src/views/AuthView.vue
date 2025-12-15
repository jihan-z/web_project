<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>{{ isLogin ? '用户登录' : '用户注册' }}</h2>
      <el-form :model="form" :rules="rules" ref="authForm" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
          <el-button @click="toggleAuthMode">
            {{ isLogin ? '去注册' : '去登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'AuthView',
  setup() {
    const isLogin = ref(true)
    const loading = ref(false)
    const router = useRouter()
    
    const form = reactive({
      username: '',
      password: '',
      confirmPassword: ''
    })
    
    const authForm = ref(null)
    
    const toggleAuthMode = () => {
      isLogin.value = !isLogin.value
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (!isLogin.value && value !== form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }
    
    const handleSubmit = async () => {
      authForm.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            // 这里应该是调用API的地方
            // 暂时模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
            router.push('/dashboard')
          } catch (error) {
            ElMessage.error(error.message || (isLogin.value ? '登录失败' : '注册失败'))
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    return {
      isLogin,
      loading,
      form,
      authForm,
      rules,
      toggleAuthMode,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.auth-box {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.auth-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>