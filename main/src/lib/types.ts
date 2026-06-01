export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; display_order: number; created_at: string }
        Insert: { id?: string; name: string; display_order?: number; created_at?: string }
        Update: { id?: string; name?: string; display_order?: number }
      }
      images: {
        Row: { id: string; category_id: string | null; filename: string; storage_path: string; url: string; width: number | null; height: number | null; created_at: string }
        Insert: { id?: string; category_id?: string | null; filename: string; storage_path: string; url: string; width?: number | null; height?: number | null }
        Update: { category_id?: string | null; filename?: string }
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Image = Database['public']['Tables']['images']['Row']

export type CategoryWithImages = Category & { images: Image[] }
