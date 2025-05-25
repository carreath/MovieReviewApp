import React, { useEffect, useState } from "react";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";
import "./ReviewForm.css";

interface ReviewFormProps {
  userId: number;
  selectedMovie: Movie | null;
  reviews?: Review[];
  onReviewCreatedOrUpdated: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ userId, selectedMovie, reviews = [], onReviewCreatedOrUpdated }) => {
  const [rating, setRating] = useState<number | undefined>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [existingReview, setExistingReview] = useState(false);

  useEffect(() => {
    const existingReviewObj = reviews.find((r) => r.userId === userId && selectedMovie && r.movieId === selectedMovie.id);
    if (existingReviewObj) {
      setRating(existingReviewObj.rating);
      setComment(existingReviewObj.comment);
      setExistingReview(true);
    } else {
      setExistingReview(false);
      setRating(5);
      setComment("");
    }
  }, [reviews, userId, selectedMovie, setExistingReview]);

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
    <div className="review-form">
      <h3>{existingReview ? "Update Review" : "Add a Review"}</h3>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Rating (1-10):</label>
        <input type="number" max="10" min="1" value={rating} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)} />
        <label>Comment:</label>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ReviewForm;
