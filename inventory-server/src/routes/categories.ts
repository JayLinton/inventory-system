import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// 1. 获取所有分类
app.get('/', async (c) => {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } })
  return c.json({ success: true, data: categories })
})

// 2. 创建分类
app.post('/', async (c) => {
  const body = await c.req.json()
  if (!body.name) return c.json({ success: false, error: '名称不能为空' }, 400)

  try {
    const category = await prisma.category.create({
      data: { name: body.name }
    })
    return c.json({ success: true, data: category })
  } catch (e) {
    return c.json({ success: false, error: '创建失败' }, 500)
  }
})

// 3. 修改分类 (重命名)
app.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name }
    })
    return c.json({ success: true, data: category })
  } catch (e) {
    return c.json({ success: false, error: '更新失败' }, 500)
  }
})

// 4. 删除分类 (带保护)
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  
  try {
    // 检查该分类下是否有商品
    const count = await prisma.product.count({
      where: { categoryId: id }
    })

    if (count > 0) {
      return c.json({ success: false, error: `无法删除：该分类下还有 ${count} 个商品` }, 409)
    }

    await prisma.category.delete({ where: { id } })
    return c.json({ success: true })
  } catch (e) {
    return c.json({ success: false, error: '删除失败' }, 500)
  }
})

export default app