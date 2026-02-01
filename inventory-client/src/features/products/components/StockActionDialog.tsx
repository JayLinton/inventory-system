import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, stockIn, stockOut } from "../services/productService";

// 必须导出这个类型，因为父组件用到了它
export type StockActionType = 'in' | 'out';

interface StockActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  type: StockActionType;
  onSuccess: () => void;
}

// 必须导出这个组件
export const StockActionDialog = ({
  isOpen,
  onClose,
  product,
  type,
  onSuccess,
}: StockActionDialogProps) => {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!product || !quantity || Number(quantity) <= 0) {
      alert("请输入有效的数量");
      return;
    }

    setLoading(true);
    try {
      const qty = Number(quantity);
      const safeReason = reason || (type === 'in' ? '手动补货' : '手动出库');

      if (type === 'in') {
        await stockIn(product.id, qty, safeReason);
      } else {
        await stockOut(product.id, qty, safeReason);
      }
      
      onSuccess(); 
      onClose();   
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "操作失败";
      alert(`错误: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const title = type === 'in' ? "商品补货 (入库)" : "商品销售 (出库)";
  const colorClass = type === 'in' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label>商品名称</Label>
            <div className="font-medium text-gray-700">{product?.name}</div>
            <div className="text-xs text-gray-400">SKU: {product?.sku}</div>
          </div>

          <div className="grid gap-2">
            <Label>数量 *</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="请输入数量"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>备注原因</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'in' ? "例如：采购进货" : "例如：门店销售"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} className={colorClass} disabled={loading}>
            {loading ? "提交中..." : "确认提交"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};