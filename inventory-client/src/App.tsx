import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
// 1. 引入 Toaster 组件 (用于显示右上角的成功/失败提示)
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      {/* 2. 把 Toaster 放在这里，确保它在整个应用中都生效 */}
      <Toaster />

      <Routes>
        {/* 外层套上 MainLayout (带侧边栏的壳子) */}
        <Route path="/" element={<MainLayout />}>
          
          {/* 默认首页 -> 显示仪表盘 */}
          <Route index element={<DashboardPage />} />
          
          {/* 访问 /inventory -> 显示商品管理页 */}
          <Route path="inventory" element={<InventoryPage />} />
          
          {/* 访问 /settings -> 暂时没写，跳回首页 */}
          <Route path="settings" element={<Navigate to="/" replace />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;