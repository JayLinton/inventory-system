import axios from 'axios';

export interface Category {
  id: number;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get('/api/categories');
  return res.data.success ? res.data.data : [];
};

export const createCategory = async (name: string): Promise<Category> => {
  const res = await axios.post('/api/categories', { name });
  return res.data.data;
};

// 新增：更新
export const updateCategory = async (id: number, name: string): Promise<void> => {
  await axios.put(`/api/categories/${id}`, { name });
};

// 新增：删除
export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`/api/categories/${id}`);
};