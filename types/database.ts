export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          business_name: string
          phone: string | null
          service_zips: string[] | null
          payment_provider: 'stripe' | 'square' | null
          stripe_account_id: string | null
          square_merchant_id: string | null
          invoice_template: string
          default_tax_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          business_name: string
          phone?: string | null
          service_zips?: string[] | null
          payment_provider?: 'stripe' | 'square' | null
          stripe_account_id?: string | null
          square_merchant_id?: string | null
          invoice_template?: string
          default_tax_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string
          phone?: string | null
          service_zips?: string[] | null
          payment_provider?: 'stripe' | 'square' | null
          stripe_account_id?: string | null
          square_merchant_id?: string | null
          invoice_template?: string
          default_tax_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          phone: string | null
          email: string | null
          notes: string | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          quick_customer: Json | null
          scheduled_date: string
          time_window: string
          status: string
          type: string
          notes: string | null
          photos: string[] | null
          created_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id?: string | null
          quick_customer?: Json | null
          scheduled_date: string
          time_window: string
          status?: string
          type: string
          notes?: string | null
          photos?: string[] | null
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          quick_customer?: Json | null
          scheduled_date?: string
          time_window?: string
          status?: string
          type?: string
          notes?: string | null
          photos?: string[] | null
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
      estimate_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          default_price: number
          last_used_price: number | null
          usage_count: number
          price_history: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          default_price: number
          last_used_price?: number | null
          usage_count?: number
          price_history?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          default_price?: number
          last_used_price?: number | null
          usage_count?: number
          price_history?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          job_id: string
          items: Json
          subtotal: number
          tax: number
          total: number
          signature_url: string | null
          signed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          items: Json
          subtotal: number
          tax?: number
          total: number
          signature_url?: string | null
          signed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          items?: Json
          subtotal?: number
          tax?: number
          total?: number
          signature_url?: string | null
          signed_at?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          estimate_id: string
          payment_provider: string | null
          payment_intent_id: string | null
          status: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          estimate_id: string
          payment_provider?: string | null
          payment_intent_id?: string | null
          status?: string
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          estimate_id?: string
          payment_provider?: string | null
          payment_intent_id?: string | null
          status?: string
          paid_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}