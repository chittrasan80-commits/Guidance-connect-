export type Role = 'student' | 'counselor' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  bio?: string;
  specialization?: string;
}

export interface Appointment {
  id: number;
  student_id: number;
  counselor_id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  counselor_name?: string;
  student_name?: string;
}

export interface Resource {
  id: number;
  title: string;
  category: string;
  content: string;
  type: 'article' | 'video' | 'link';
}
