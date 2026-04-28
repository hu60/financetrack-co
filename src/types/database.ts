// Tipos generados manualmente para Supabase
// Cuando tengas el proyecto en Supabase, puedes regenerar con:
//   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description?: string | null
          date: string
          created_at?: string
        }
        Update: {
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          description?: string | null
          date?: string
        }
      }
      debts: {
        Row: {
          id: string
          user_id: string
          creditor_name: string
          total_amount: number
          paid_amount: number
          interest_rate: number | null
          due_date: string | null
          status: 'active' | 'paid' | 'overdue'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          creditor_name: string
          total_amount: number
          paid_amount?: number
          interest_rate?: number | null
          due_date?: string | null
          status?: 'active' | 'paid' | 'overdue'
          notes?: string | null
          created_at?: string
        }
        Update: {
          creditor_name?: string
          total_amount?: number
          paid_amount?: number
          interest_rate?: number | null
          due_date?: string | null
          status?: 'active' | 'paid' | 'overdue'
          notes?: string | null
        }
      }
      debt_payments: {
        Row: {
          id: string
          debt_id: string
          user_id: string
          amount: number
          payment_date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          debt_id: string
          user_id?: string
          amount: number
          payment_date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          amount?: number
          payment_date?: string
          note?: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category: string
          amount: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          category?: string
          amount?: number
          month?: number
          year?: number
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          emoji: string
          status: 'active' | 'completed' | 'paused'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          emoji?: string
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
        }
        Update: {
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          emoji?: string
          status?: 'active' | 'completed' | 'paused'
        }
      }
      savings_contributions: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          amount: number
          contribution_date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id?: string
          amount: number
          contribution_date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          note?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      transaction_type: 'income' | 'expense'
      debt_status: 'active' | 'paid' | 'overdue'
      goal_status: 'active' | 'completed' | 'paused'
    }
  }
}
