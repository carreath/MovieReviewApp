import React, { useState } from "react";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";

interface ReviewFormProps {
  userId: number;
  selectedMovie: Movie | null;
  onReviewCreatedOrUpdated: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ userId, selectedMovie, onReviewCreatedOrUpdated }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) {
      setError("Please select a movie first.");
      return;
    }
    try {
      setError("");
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          movieId: selectedMovie.id,
          rating,
          comment,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add or update review");
      }
      const newReview = await response.json();
      onReviewCreatedOrUpdated(newReview);

      // Reset form
      setRating(5);
      setComment("");
    } catch (err) {
      setError("Error submitting review");
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Add a Review</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Rating (1-10):</label>
        <input type="number" min="1" max="10" value={rating} onChange={(e) => setRating(Number(e.target.value))} />

        <label>Comment:</label>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ReviewForm;
