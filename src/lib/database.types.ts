export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      barbers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          is_active: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          is_active?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          is_active?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          duration_minutes: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          barber_id: string | null;
          service_id: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          barber_id?: string | null;
          service_id?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          barber_id?: string | null;
          service_id?: string | null;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          appointment_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          amount: number;
          payment_method: string;
          payment_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          created_at?: string;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          category_id: string | null;
          description: string;
          amount: number;
          expense_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          description: string;
          amount: number;
          expense_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          description?: string;
          amount?: number;
          expense_date?: string;
          created_at?: string;
        };
      };
    };
  };
}
