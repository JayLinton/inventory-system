import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// 获取所有库位
app.get('/', async (c) => {
  const list = await prisma.location.findMany({ orderBy: { code: 'asc' } })
  return c.json({ success: true, data: list })
})

// 创建库位
app.post('/', async (c) => {
  const body = await c.req.json()
  try {
    const loc = await prisma.location.create({
      data: {
        code: body.code,
        warehouse: body.warehouse || '主仓库',
        zone: body.zone,
        type: body.type,
        status: body.status,
        capacity: Number(body.capacity) || 0,
        remark: body.remark
      }
    })
    return c.json({ success: true, data: loc })
  } catch (e: any) {
    if (e.code === 'P2002') return c.json({ success: false, error: '库位编号已存在' }, 409)
    return c.json({ success: false, error: '创建失败' }, 500)
  }
})

// 删除库位
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  try {
    // 检查是否有商品占用
    const count = await prisma.product.count({ where: { locationId: id } })
    if (count > 0) return c.json({ success: false, error: `该库位上有 ${count} 个商品，无法删除` }, 409)

    await prisma.location.delete({ where: { id } })
    return c.json({ success: true })
  } catch (e) {
    return c.json({ success: false, error: '删除失败' }, 500)
  }
})

export default app