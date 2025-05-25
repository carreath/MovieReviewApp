export interface Movie {
  id: number;
  title: string;
  description: string;
  tags: string[];
  recommended_by?: string;
}

export interface Review {
  id: number;
  userId: number;       // e.g., "1"
  movieId: number;    // links to Movie.id
  rating: number;     // 1 - 10
  comment: string;
  date: string;       // ISO string
}
