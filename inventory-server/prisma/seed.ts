import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. 创建默认分类 (ID=1)
  const defaultCategory = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '默认分类',
      sortOrder: 1
    }
  })
  console.log('✅ 默认分类已就绪:', defaultCategory.name)

  // 2. 创建默认仓库 (ID=1)
  const defaultWarehouse = await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '主仓库',
      address: '默认发货仓',
      manager: '管理员'
    }
  })
  console.log('✅ 默认仓库已就绪:', defaultWarehouse.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
