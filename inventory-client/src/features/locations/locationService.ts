import axios from 'axios';

export interface Location {
  id: number;
  code: string;
  warehouse: string;
  zone?: string;
  type: 'RECEIVING' | 'PICKING' | 'STORAGE';
  status: 'ACTIVE' | 'DISABLED' | 'FULL';
  capacity?: number;
  remark?: string;
}

export const getLocations = async (): Promise<Location[]> => {
  const res = await axios.get('/api/locations');
  return res.data.success ? res.data.data : [];
};

export const createLocation = async (data: Partial<Location>): Promise<Location> => {
  const res = await axios.post('/api/locations', data);
  return res.data.data;
};

export const deleteLocation = async (id: number): Promise<void> => {
  await axios.delete(`/api/locations/${id}`);
};