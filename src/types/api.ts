// ─────────────────────────────────────────────────────────────────────────────
// Base MongoDB document fields (every document has these after creation)
// ─────────────────────────────────────────────────────────────────────────────
interface MongoDoc {
  _id: string;
  /** Mongoose also exposes a virtual `id` string getter */
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Novel  (maps to models/Novel.js)
// ─────────────────────────────────────────────────────────────────────────────
export interface Novel extends MongoDoc {
  title: string;
  slug: string;
  author: string;
  authorId: string;
  cover: string;
  coverPublicId: string;
  description: string;
  genres: string[];
  tags: string[];
  status: "ongoing" | "completed";
  rating: number;
  ratingCount: number;
  views: number;
  viewsToday: number;
  viewsWeek: number;
  viewsMonth: number;
  chapterCount: number;
  isOriginal: boolean;
  /** Empty array means visible on ALL sites */
  sites: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter  (maps to models/Chapter.js)
// ─────────────────────────────────────────────────────────────────────────────
export interface Chapter extends MongoDoc {
  novelId: string;
  authorId: string;
  number: number;
  title: string;
  content: string;
  views: number;
  wordCount: number;
}

/**
 * Chapter list items — the list endpoint uses `.select('-content')`
 * so `content` is never present in list responses.
 */
export type ChapterMeta = Omit<Chapter, "content">;

// ─────────────────────────────────────────────────────────────────────────────
// User  (maps to models/User.js)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape returned by /auth/login and /auth/register (publicUser() helper).
 * Uses `id` (string), NOT `_id`.
 */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: "reader" | "admin";
  authProvider: "google" | "email" | "both";
}

/**
 * Shape returned by GET /auth/me — full Mongoose doc minus password/googleId.
 * Mongoose adds a virtual `id` string alongside `_id`.
 */
export interface AuthMeUser extends MongoDoc {
  email: string;
  name: string;
  avatar: string;
  role: "reader" | "admin";
  authProvider: "google" | "email" | "both";
  /** Array of bookmarked novel ObjectId strings */
  bookmarks: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment  (maps to models/Comment.js)
// ─────────────────────────────────────────────────────────────────────────────
export interface Comment extends MongoDoc {
  novelId: string;
  /** null = novel-level comment; number = chapter-level */
  chapterNum: number | null;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  /** Array of user ObjectId strings who liked this comment */
  likes: string[];
  isGhost: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated response wrappers
// ─────────────────────────────────────────────────────────────────────────────
export interface PaginatedNovels {
  novels: Novel[];
  total: number;
  pages: number;
}

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  pages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth response shapes
// ─────────────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: PublicUser;
}

// ─────────────────────────────────────────────────────────────────────────────
// Misc small response shapes
// ─────────────────────────────────────────────────────────────────────────────
export interface MessageResponse {
  message: string;
}

export interface RateResponse {
  rating: number;
  ratingCount: number;
}

export interface LikeResponse {
  likes: number;
  liked: boolean;
}
