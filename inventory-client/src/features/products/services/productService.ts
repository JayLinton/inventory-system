import axios from 'axios';

// --- 类型定义 ---

// 后端返回的商品对象结构
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;         // 计算后的总库存
  categoryId?: number;   // 关联的分类 ID
  category?: {           // 关联的分类对象
    id: number;
    name: string;
  };
}

// 创建或更新商品时的参数类型
export interface CreateProductParams {
  name: string;
  sku: string;
  price: number;
  costPrice?: number;
  initialStock?: number; // 仅在创建时使用
  categoryId?: number;   // 必选的分类 ID
}

// 分页列表的返回结构 (包含 meta 元数据)
export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;       // 总条数
    page: number;        // 当前页码
    limit: number;       // 每页条数
    totalPages: number;  // 总页数
  };
}

// 查询参数类型
interface GetProductsParams {
  page?: number;
  limit?: number;
  q?: string;            // 搜索关键词
  categoryId?: number | 'all';
}

// --- API 请求函数 ---

// 1. 获取商品列表 (支持分页、搜索、分类)
export const getProducts = async (params: GetProductsParams = {}): Promise<ProductsResponse> => {
  // axios 会自动将对象转换为查询字符串 (例如 ?page=1&q=abc)
  const res = await axios.get('/api/products', { params });
  
  if (res.data.success) {
    return res.data; // 返回后端给的完整结构 { data, meta }
  }
  
  // 兜底：如果请求失败或格式不对，返回空结构防止页面报错
  return { 
    data: [], 
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 } 
  };
};

// 2. 创建商品
export const createProduct = async (data: CreateProductParams): Promise<Product> => {
  const res = await axios.post('/api/products', data);
  return res.data.data;
};

// 3. 更新商品
export const updateProduct = async (id: number, data: Partial<CreateProductParams>): Promise<Product> => {
  const res = await axios.put(`/api/products/${id}`, data);
  return res.data.data;
};

// 4. 商品入库 (补货)
export const stockIn = async (productId: number, quantity: number, reason?: string): Promise<void> => {
  await axios.post('/api/inventory/in', {
    productId,
    quantity,
    warehouseId: 1, // 暂时默认仓库 ID 为 1
    reason: reason || '手动补货'
  });
};

// 5. 商品出库 (销售/损耗)
export const stockOut = async (productId: number, quantity: number, reason?: string): Promise<void> => {
  await axios.post('/api/inventory/out', {
    productId,
    quantity,
    warehouseId: 1,
    reason: reason || '手动出库'
  });
};