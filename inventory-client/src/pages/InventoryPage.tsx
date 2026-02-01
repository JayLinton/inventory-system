import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tags, Layers, FilterX, Search, ChevronLeft, ChevronRight } from "lucide-react"; 

// 引入业务组件
import { getProducts, Product, ProductsResponse } from '../features/products/services/productService';
import { getCategories, Category } from '../features/categories/categoryService';
import { ProductTable } from '../features/products/components/ProductTable';
import { ProductFormDialog } from '../features/products/components/AddProductDialog';
import { StockActionDialog, StockActionType } from '../features/products/components/StockActionDialog';
import { CategoryManager } from '../features/categories/components/CategoryManager';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 查询状态 ---
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  
  // 分页状态
  const [page, setPage] = useState(1);
  // 默认 limit 设为 5，方便你测试分页效果（正式上线可以改为 10）
  const [limit] = useState(10); 
  const [meta, setMeta] = useState<ProductsResponse['meta']>({ total: 0, page: 1, limit: 5, totalPages: 0 });

  // --- 弹窗状态 ---
  const [stockDialogState, setStockDialogState] = useState<{
    isOpen: boolean; product: Product | null; type: StockActionType;
  }>({ isOpen: false, product: null, type: 'in' });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // --- 加载数据 ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page: page,
        limit: limit, // 使用 state 里的 limit
        q: searchQuery,
        categoryId: activeCategory
      });
      setProducts(res.data);
      // 确保 meta 存在，防止后端没重启导致报错
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, activeCategory]);

  // 初始化加载分类
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // 监听条件变化自动查询
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 事件处理 ---
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // 搜索重置页码
  };

  const handleCategoryChange = (id: number | 'all') => {
    setActiveCategory(id);
    setPage(1); // 切换分类重置页码
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 顶部标题 & 操作区 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">商品管理</h2>
          <p className="text-gray-500">管理库存商品及价格信息</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)}>
            <Tags className="w-4 h-4 mr-2" />
            分类管理
          </Button>
          <ProductFormDialog onSuccess={fetchProducts} />
        </div>
      </div>

      {/* 2. 筛选 & 搜索栏 (已去除白色背景，融入页面) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* 左侧：分类筛选 (透明背景) */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap mr-1 flex items-center">
            <Layers className="w-4 h-4 mr-1" /> 筛选:
          </span>
          
          <Button
            variant={activeCategory === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange('all')}
            className={`rounded-full px-4 h-8 ${activeCategory === 'all' ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent border-gray-300 text-gray-600 hover:bg-white'}`}
          >
            全部
          </Button>

          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
              className={`rounded-full px-4 h-8 whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                  : 'bg-transparent border-gray-300 text-gray-600 hover:bg-white'
              }`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* 右侧：搜索框 (保留白色背景以便输入) */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索商品名称或SKU..."
            className="pl-9 h-9 bg-white border-gray-200 focus:border-blue-500 shadow-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 3. 表格区域 */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            商品列表
            {/* 显示总条数 */}
            <span className="text-xs text-gray-400 font-normal border-l pl-2 ml-1">
              共 {meta.total} 条数据
            </span>
          </CardTitle>
          
          {(activeCategory !== 'all' || searchQuery) && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-6 text-xs text-gray-500 hover:text-red-500" 
               onClick={() => {
                 setActiveCategory('all');
                 setSearchQuery('');
                 setPage(1);
               }}
             >
               <FilterX className="w-3 h-3 mr-1" /> 重置筛选
             </Button>
          )}
        </CardHeader>
        
        <CardContent>
          <ProductTable 
            products={products} 
            isLoading={loading} 
            onOpenStockDialog={(p, type) => setStockDialogState({ isOpen: true, product: p, type })}
            onEdit={(p) => { setEditProduct(p); setIsFormOpen(true); }} 
          />
          
          {!loading && products.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              暂无匹配商品
            </div>
          )}

          {/* 4. 分页器 (只要总页数 > 1 就显示) */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between py-4 border-t mt-4">
              <div className="text-xs text-gray-500">
                显示第 {((page - 1) * limit) + 1} 到 {Math.min(page * limit, meta.total)} 条
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                
                <span className="text-sm font-medium px-2">
                  {page} / {meta.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= meta.totalPages || loading}
                  className="h-8 px-2"
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 弹窗挂载 */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if(!open) setEditProduct(null); }}
        editProduct={editProduct}
        onSuccess={fetchProducts}
      />

      <StockActionDialog
        isOpen={stockDialogState.isOpen}
        onClose={() => setStockDialogState(prev => ({ ...prev, isOpen: false }))}
        product={stockDialogState.product}
        type={stockDialogState.type}
        onSuccess={fetchProducts}
      />

      <CategoryManager 
        open={isCategoryManagerOpen} 
        onOpenChange={(open) => { setIsCategoryManagerOpen(open); if(!open) fetchProducts(); }} 
      />
    </div>
  );
}