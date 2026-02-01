import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// 引入 Alert Dialog 组件 (用于删除确认)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// 引入 toast (用于替代 alert)
import { toast } from "sonner"; 

import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category 
} from "../categoryService";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryManager = ({ open, onOpenChange }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 新增分类状态
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 编辑状态
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // --- 新增：删除确认弹窗的状态 ---
  // 存储当前“准备删除”的那个分类ID，如果为 null 则不显示弹窗
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      toast.error("加载分类列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchCategories();
  }, [open]);

  // --- 添加 ---
  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    setIsAdding(true);
    try {
      await createCategory(newCategoryName);
      setNewCategoryName("");
      toast.success("分类创建成功");
      fetchCategories();
    } catch (error) {
      toast.error("创建失败，请重试");
    } finally {
      setIsAdding(false);
    }
  };

  // --- 点击删除按钮 (仅打开确认框，不执行删除) ---
  const openDeleteConfirm = (category: Category) => {
    setDeleteTarget(category); // 设置当前要删除的目标，触发 AlertDialog 显示
  };

  // --- 确认删除 (真正执行 API) ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("分类已删除");
      fetchCategories(); 
      setDeleteTarget(null); // 关闭确认框
    } catch (error: any) {
      // 捕获后端返回的“无法删除”错误
      const msg = error.response?.data?.error || "删除失败";
      toast.error(msg); // 用 toast 显示错误，而不是 alert
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 编辑逻辑 ---
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, editName);
      setEditingId(null);
      toast.success("分类名称已更新");
      fetchCategories();
    } catch (error) {
      toast.error("更新失败");
    }
  };

  return (
    <>
      {/* 主管理弹窗 */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>分类管理</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            {/* 添加区 */}
            <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border">
              <div className="grid gap-1 flex-1">
                <Label htmlFor="cat-name" className="text-xs text-gray-500">创建新分类</Label>
                <Input 
                  id="cat-name"
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="输入名称..."
                  className="bg-white"
                />
              </div>
              <Button onClick={handleAdd} disabled={isAdding || !newCategoryName.trim()}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="ml-2">添加</span>
              </Button>
            </div>

            {/* 列表区 */}
            <div className="space-y-2">
              <Label className="text-gray-500 text-sm">已有分类 ({categories.length})</Label>
              
              <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                {loading && categories.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">加载中...</div>
                )}
                
                {categories.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    
                    {editingId === item.id ? (
                      // 编辑态
                      <div className="flex items-center gap-2 flex-1 animate-in fade-in zoom-in-95 duration-200">
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700" onClick={() => saveEdit(item.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      // 展示态
                      <>
                        <span className="text-sm font-medium text-gray-700 pl-1">{item.name}</span>
                        
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => startEdit(item)}
                            title="重命名"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteConfirm(item)} 
                            title="删除分类"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- 删除确认弹窗 (Alert Dialog) --- */}
      {/* 只有当 deleteTarget 有值时，open 属性为 true */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类？</AlertDialogTitle>
            <AlertDialogDescription>
              即将删除分类 <span className="font-bold text-black">“{deleteTarget?.name}”</span>。
              <br />
              此操作无法撤销。如果该分类下仍有商品，您需要先移除或转移商品。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // 阻止默认关闭，等待 API 完成
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};