import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// 1. 获取列表
app.get('/', async (c) => {
  try {
    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 10
    const search = c.req.query('q') || ''
    const categoryId = c.req.query('categoryId')

    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ]
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = Number(categoryId)
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        // 关键：包含关联数据
        include: { category: true, stocks: true, location: true }, 
        orderBy: { id: 'desc' },
        skip,
        take: limit
      })
    ])
    
    // --- 关键修复：处理 Decimal 转 Number，防止 500 错误 ---
    const data = products.map(p => {
      const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0)
      return { 
        ...p, 
        // 强制把 Decimal 类型转为数字
        price: Number(p.price),
        costPrice: Number(p.costPrice),
        stock: totalStock 
      }
    })

    return c.json({ 
      success: true, 
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("GET Products Error:", error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 2. 创建商品
app.post('/', async (c) => {
  const body = await c.req.json()
  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        // 存入时转为数字
        price: Number(body.price),
        costPrice: Number(body.costPrice) || 0,
        categoryId: Number(body.categoryId),
        locationId: body.locationId ? Number(body.locationId) : null,
        
        // 可选字段
        description: body.description,
        barcode: body.barcode,
        image: body.image
      }
    })
    return c.json({ 
      success: true, 
      data: { 
        ...product, 
        price: Number(product.price), 
        costPrice: Number(product.costPrice) 
      } 
    })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') return c.json({ success: false, error: 'SKU 已存在' }, 409)
    return c.json({ success: false, error: '创建失败' }, 500)
  }
})

// 3. 更新商品
app.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku,
        price: Number(body.price),
        costPrice: Number(body.costPrice) || 0,
        categoryId: Number(body.categoryId),
        locationId: body.locationId ? Number(body.locationId) : null,
        
        description: body.description,
        barcode: body.barcode,
        image: body.image
      }
    })
    return c.json({ 
      success: true, 
      data: { 
        ...product, 
        price: Number(product.price), 
        costPrice: Number(product.costPrice) 
      } 
    })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') return c.json({ success: false, error: 'SKU 已存在' }, 409)
    return c.json({ success: false, error: '更新失败' }, 500)
  }
})

export default app