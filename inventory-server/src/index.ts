import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { cors } from 'hono/cors'
import products from './routes/products'   // 商品路由
import inventory from './routes/inventory' // 库存路由 (新增)
import categories from './routes/categories'
import locations from './routes/locations'

const app = new Hono()
const prisma = new PrismaClient()

// 1. 全局中间件：允许跨域 (CORS)
app.use('/*', cors())

// 2. 根路径健康检查
app.get('/', (c) => {
  return c.json({ message: '🚀 Inventory-Core API is running!' })
})

// 3. 数据库健康检查
app.get('/api/health', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return c.json({ 
      status: 'success', 
      db_connection: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ 
      status: 'error', 
      db_connection: 'failed', 
      error: String(error) 
    }, 500)
  }
})

// --- 4. 注册业务路由 ---
app.route('/api/products', products)   // 挂载商品接口
app.route('/api/inventory', inventory) // 挂载库存接口
app.route('/api/categories', categories)
app.route('/api/locations', locations)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})