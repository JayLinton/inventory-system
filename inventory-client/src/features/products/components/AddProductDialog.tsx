import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import { createProduct, updateProduct, Product } from "../services/productService";
import { getCategories, Category } from "../../categories/categoryService";
import { getLocations, Location } from "../../locations/locationService";

interface ProductFormDialogProps {
  onSuccess: () => void;
  editProduct?: Product | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ProductFormDialog = ({ onSuccess, editProduct, open: controlledOpen, onOpenChange }: ProductFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', costPrice: '', initialStock: '', categoryId: '', locationId: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      Promise.all([getCategories(), getLocations()])
        .then(([cats, locs]) => {
          setCategories(cats);
          setLocations(locs);
        })
        .catch(() => setErrorMessage("加载基础数据失败（请检查后端服务是否重启）"));
      setErrorMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        sku: editProduct.sku,
        price: String(editProduct.price),
        costPrice: editProduct.costPrice ? String(editProduct.costPrice) : '',
        initialStock: '',
        categoryId: editProduct.category?.id 
          ? String(editProduct.category.id) 
          : (editProduct.categoryId ? String(editProduct.categoryId) : ''),
        
        // 如果有库位 ID，转字符串；如果没有，设为 'unassigned' 或空字符串
        locationId: editProduct.location?.id 
          ? String(editProduct.location.id) 
          : (editProduct.locationId ? String(editProduct.locationId) : 'unassigned')
      });
    } else {
      if (!isOpen) {
        // 重置时 locationId 默认为 'unassigned'
        setFormData({ name: '', sku: '', price: '', costPrice: '', initialStock: '', categoryId: '', locationId: 'unassigned' });
      }
    }
  }, [editProduct, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage(""); 
  };

  const generateAutoSku = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const autoSku = `PROD-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, sku: autoSku }));
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.price || !formData.categoryId) {
      setErrorMessage("请填写所有带 * 的必填项");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        categoryId: Number(formData.categoryId),
        // 关键修复：如果值是 'unassigned'，传 undefined 给后端
        locationId: (formData.locationId && formData.locationId !== 'unassigned') ? Number(formData.locationId) : undefined
      };

      if (editProduct) {
        await updateProduct(editProduct.id, payload);
      } else {
        await createProduct({
          ...payload,
          initialStock: Number(formData.initialStock)
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const backendMsg = error.response?.data?.error || "操作失败，请重试";
      setErrorMessage(backendMsg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">+ 新建商品</Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editProduct ? "编辑商品" : "添加新商品"}</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 flex items-center gap-2">
            <span>⚠️</span><span>{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>商品名称 *</Label>
            <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="例如：夏季纯棉T恤" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>所属分类 *</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="选择分类..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                  {categories.length === 0 && <div className="p-2 text-xs text-gray-500 text-center">暂无分类</div>}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>存放库位</Label>
              {/* 这里 value 如果是空字符串会导致报错，所以默认为 'unassigned' */}
              <Select 
                value={formData.locationId || 'unassigned'} 
                onValueChange={(v) => setFormData(p => ({ ...p, locationId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="选择库位..." /></SelectTrigger>
                <SelectContent>
                  {/* 关键修复：用 unassigned 代替空字符串 */}
                  <SelectItem value="unassigned">未分配</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={String(loc.id)}>
                      {loc.code} {loc.zone ? ` (${loc.zone})` : ''} {loc.status === 'FULL' ? ' [已满]' : ''}
                    </SelectItem>
                  ))}
                  {locations.length === 0 && <div className="p-2 text-xs text-gray-500 text-center">暂无库位</div>}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>SKU (唯一编码) *</Label>
            <div className="flex gap-2">
              <Input 
                name="sku" 
                value={formData.sku} 
                onChange={handleInputChange} 
                className={errorMessage.includes("SKU") ? "border-red-500 bg-red-50" : ""}
              />
              <Button variant="outline" onClick={generateAutoSku} title="自动生成 SKU" type="button">
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span className="ml-2 text-xs">自动</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>销售价格 *</Label>
              <Input name="price" type="number" value={formData.price} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label>成本价</Label>
              <Input name="costPrice" type="number" value={formData.costPrice} onChange={handleInputChange} placeholder="0.00" />
            </div>
          </div>

          {!editProduct && (
            <div className="grid gap-2 border-t pt-4 mt-2">
              <Label className="text-blue-600 font-bold">初始库存</Label>
              <Input name="initialStock" type="number" value={formData.initialStock} onChange={handleInputChange} placeholder="0" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};