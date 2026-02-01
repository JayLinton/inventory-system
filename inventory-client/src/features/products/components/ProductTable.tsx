import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Pencil, MapPin } from "lucide-react";
import { Product } from "../services/productService";
import { StockActionType } from "./StockActionDialog";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onOpenStockDialog: (product: Product, type: StockActionType) => void;
  onEdit: (product: Product) => void;
}

export const ProductTable = ({ products, isLoading, onOpenStockDialog, onEdit }: ProductTableProps) => {
  if (isLoading) {
    return <div className="text-center py-12 text-gray-500 animate-pulse">正在加载数据...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">ID</TableHead>
          <TableHead>商品名称</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>分类</TableHead>
          <TableHead>库位</TableHead>
          <TableHead>成本</TableHead>
          <TableHead>库存</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="text-gray-500">#{p.id}</TableCell>
            <TableCell 
              className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
              onClick={() => onEdit(p)}
            >
              {p.name}
            </TableCell>
            <TableCell className="text-xs text-gray-500 font-mono">{p.sku}</TableCell>
            <TableCell className="text-sm text-gray-600">
              {p.category ? p.category.name : '-'}
            </TableCell>
            <TableCell>
              {p.location ? (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                  <MapPin className="w-3 h-3" />
                  {p.location.code}
                </div>
              ) : (
                <span className="text-gray-400 text-xs">-</span>
              )}
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              ¥{p.costPrice || '0.00'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {p.stock}
                </span>
                {p.stock <= 5 && p.stock > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">低库存</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                  onClick={() => onEdit(p)}
                  title="编辑详情"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-gray-200 mx-1 self-center" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 text-green-700"
                  onClick={() => onOpenStockDialog(p, 'in')}
                  title="补货"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 text-red-700"
                  onClick={() => onOpenStockDialog(p, 'out')}
                  title="出库"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};