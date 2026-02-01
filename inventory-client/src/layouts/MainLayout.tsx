import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MainLayout() {
  const location = useLocation();

  // 菜单配置
  const menuItems = [
    { icon: LayoutDashboard, label: "仪表盘", path: "/" },
    { icon: Package, label: "商品管理", path: "/inventory" },
    { icon: Settings, label: "系统设置", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* 1. 左侧侧边栏 */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col z-10">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Inventory
          </span>
        </div>

        {/* 菜单区域 */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 底部按钮 */}
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 2. 右侧内容区域 */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* 这里是页面切换的出口 */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}