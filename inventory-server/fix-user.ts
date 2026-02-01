import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // 修正版：去掉了不存在的 role 字段
    const user = await prisma.user.create({
      data: {
        email: 'admin@inventory.com',
        name: 'Super Admin',
        password: 'placeholder_password_hash' 
        // 这里的 ID 会自动生成为 1
      }
    })
    console.log('✅ 成功创建管理员用户！')
    console.log('用户 ID:', user.id)
  } catch (error) {
    console.error('❌ 创建失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()