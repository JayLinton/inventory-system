import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// ==========================================
// 1. 入库接口 (POST /api/inventory/in)
// ==========================================
app.post('/in', async (c) => {
  try {
    const body = await c.req.json()
    
    // 1. 参数清洗与强校验
    const productId = Number(body.productId)
    const quantity = Number(body.quantity)
    const warehouseId = Number(body.warehouseId) || 1
    const reason = body.reason || '采购入库'

    // 如果转换后不是数字，或者数量小于等于0，直接拦截
    if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
      return c.json({ success: false, error: '参数错误：无效的商品ID或数量' }, 400)
    }

    // 2. 开启事务 (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 检查商品是否存在
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new Error('商品不存在')

      // A. 更新库存 (Upsert: 有则改之，无则加之)
      const stock = await tx.stock.upsert({
        where: {
          productId_warehouseId: { productId, warehouseId }
        },
        update: {
          quantity: { increment: quantity } // 原有库存 + 新数量
        },
        create: {
          productId,
          warehouseId,
          quantity
        }
      })

      // B. 记录入库流水
      await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type: 'PURCHASE_IN', // 对应数据库 Enum 类型
          reason,
          userId: 1 // 暂时写死管理员ID
        }
      })

      return stock
    })

    return c.json({ success: true, data: result })

  } catch (error: any) {
    console.error("入库失败:", error)
    return c.json({ success: false, error: error.message || '服务器内部错误' }, 500)
  }
})

// ==========================================
// 2. 出库接口 (POST /api/inventory/out)
// ==========================================
app.post('/out', async (c) => {
  try {
    const body = await c.req.json()

    // 1. 参数清洗与强校验
    const productId = Number(body.productId)
    const quantity = Number(body.quantity)
    const warehouseId = Number(body.warehouseId) || 1
    const reason = body.reason || '销售出库'

    if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
      return c.json({ success: false, error: '参数错误：无效的商品ID或数量' }, 400)
    }

    // 2. 开启事务
    const result = await prisma.$transaction(async (tx) => {
      // A. 查询当前库存
      const currentStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId }
        }
      })

      // B. 检查库存是否充足
      if (!currentStock || currentStock.quantity < quantity) {
        throw new Error('库存不足，无法出库')
      }

      // C. 扣减库存
      const stock = await tx.stock.update({
        where: {
          productId_warehouseId: { productId, warehouseId }
        },
        data: {
          quantity: { decrement: quantity } // 原有库存 - 出库数量
        }
      })

      // D. 记录出库流水
      await tx.stockMovement.create({
        data: {
          productId,
          quantity, // 记录为正数即可，类型决定了它是出库
          type: 'SALES_OUT', // 对应数据库 Enum 类型
          reason,
          userId: 1
        }
      })

      return stock
    })

    return c.json({ success: true, data: result })

  } catch (error: any) {
    console.error("出库失败:", error)
    
    // 专门捕获库存不足的错误，返回 400 而不是 500
    if (error.message === '库存不足，无法出库') {
      return c.json({ success: false, error: error.message }, 400)
    }
    
    return c.json({ success: false, error: error.message || '服务器内部错误' }, 500)
  }
})

export default app