// Generated from Supabase schema — run `npx supabase gen types typescript` after DB setup
// This file will be replaced by auto-generated types

export type SubscriptionTier = "basic" | "pro" | "elite";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "unpaid";
export type SubscriptionCycle = "monthly" | "annual";
export type VideoProvider = "youtube" | "vimeo" | "mux";
export type CommunityLevel = "bronze" | "silver" | "gold" | "diamond";
export type CartFunnelStep =
  | "pricing_view"
  | "tier_selected"
  | "email_entered"
  | "payment_initiated"
  | "payment_failed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  subscription_tier: SubscriptionTier | null;
  subscription_status: SubscriptionStatus | null;
  subscription_cycle: SubscriptionCycle | null;
  subscription_start: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  trailer_video_url: string | null;
  trailer_provider: VideoProvider | null;
  trailer_video_id: string | null;
  required_tier: SubscriptionTier;
  is_published: boolean;
  release_date: string | null;
  duration_minutes: number | null;
  lesson_count: number;
  sort_order: number;
  tags: string[];
  enrolled_count: number;
  avg_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_provider: VideoProvider | null;
  video_id: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  sort_order: number;
  is_free_preview: boolean;
  attachments: LessonAttachment[];
  created_at: string;
  updated_at: string;
}

export interface LessonAttachment {
  name: string;
  url: string;
  tier_required: SubscriptionTier;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  watched_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

export interface CommunityScore {
  id: string;
  user_id: string;
  total_points: number;
  courses_completed: number;
  lessons_completed: number;
  streak_days: number;
  streak_best: number;
  last_activity_date: string | null;
  level: CommunityLevel;
  badges: Badge[];
  rank_weekly: number | null;
  rank_monthly: number | null;
  rank_alltime: number | null;
  updated_at: string;
}

export interface Badge {
  id: string;
  name_he: string;
  icon: string;
  awarded_at: string;
}
