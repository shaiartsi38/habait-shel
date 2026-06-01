import { createClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  years_experience?: number;
  bio?: string;
  photo_url?: string;
}

// ─── Operations ───────────────────────────────────────────────────

export async function dbGetMyProfile(): Promise<UserProfile | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("profiles")
    .select("id, email, role, first_name, last_name, years_experience, bio, photo_url")
    .eq("id", user.id)
    .single();

  return data as UserProfile | null;
}

export async function dbUpdateProfile(updates: Partial<Omit<UserProfile, "id" | "role">>): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("לא מחוברת");

  const { error } = await sb
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;
}

export async function dbUploadAvatar(file: File): Promise<string> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("לא מחוברת");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `avatars/${user.id}.${ext}`;

  const { data, error } = await sb.storage
    .from("course-media")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = sb.storage
    .from("course-media")
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function dbGetProfileById(id: string): Promise<UserProfile | null> {
  const sb = createClient();
  const { data } = await sb
    .from("profiles")
    .select("id, first_name, last_name, years_experience, bio, photo_url")
    .eq("id", id)
    .single();
  return data as UserProfile | null;
}
