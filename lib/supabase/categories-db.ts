import { createClient } from "./client";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export async function dbGetCategories(): Promise<CategoryRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function dbCreateCategory(name: string, slug: string): Promise<CategoryRow> {
  const sb = createClient();
  const { data, error } = await sb
    .from("categories")
    .insert({ name, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dbDeleteCategory(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}
