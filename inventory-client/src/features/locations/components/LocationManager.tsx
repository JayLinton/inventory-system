import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLocations, createLocation, deleteLocation, Location } from "../locationService";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface LocationManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LocationManager = ({ open, onOpenChange }: LocationManagerProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    code: '', zone: '', type: 'PICKING', status: 'ACTIVE', capacity: ''
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (e) { toast.error("加载库位失败"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) fetchLocations(); }, [open]);

  const handleAdd = async () => {
    if (!formData.code) return toast.error("请输入库位编号");
    setIsAdding(true);
    try {
      await createLocation({
        ...formData,
        capacity: Number(formData.capacity) || 0,
        type: formData.type as any,
        status: formData.status as any
      });
      setFormData({ code: '', zone: '', type: 'PICKING', status: 'ACTIVE', capacity: '' }); // 重置
      toast.success("库位创建成功");
      fetchLocations();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "创建失败");
    } finally { setIsAdding(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该库位？")) return;
    try {
      await deleteLocation(id);
      toast.success("已删除");
      fetchLocations();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "删除失败");
    }
  };

  // 状态颜色辅助函数
  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700';
    if (status === 'FULL') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader><DialogTitle>库位管理</DialogTitle></DialogHeader>
        
        {/* 添加区域 */}
        <div className="grid grid-cols-5 gap-3 bg-slate-50 p-4 rounded-lg border items-end">
          <div className="space-y-1">
            <Label>编号 *</Label>
            <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="A-01-01" />
          </div>
          <div className="space-y-1">
            <Label>区域</Label>
            <Input value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} placeholder="A区" />
          </div>
          <div className="space-y-1">
            <Label>类型</Label>
            <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKING">拣货区</SelectItem>
                <SelectItem value="RECEIVING">收货区</SelectItem>
                <SelectItem value="STORAGE">暂存区</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>状态</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">启用</SelectItem>
                <SelectItem value="FULL">已满</SelectItem>
                <SelectItem value="DISABLED">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} 添加
          </Button>
        </div>

        {/* 列表区域 */}
        <div className="max-h-[400px] overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>库位编号</TableHead>
                <TableHead>区域</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map(loc => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-blue-500" /> {loc.code}
                  </TableCell>
                  <TableCell>{loc.zone || '-'}</TableCell>
                  <TableCell className="text-xs">{loc.type === 'PICKING' ? '拣货' : loc.type === 'RECEIVING' ? '收货' : '暂存'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(loc.status)}`}>
                      {loc.status === 'ACTIVE' ? '正常' : loc.status === 'FULL' ? '已满' : '禁用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(loc.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};