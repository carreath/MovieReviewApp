import React, { useCallback } from "react";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";

interface Props {
  userId: number;
  selectedMovie: Movie | null;
  reviews: Review[];
  onReviewDeleted: (review: Review | null) => void;
}

const InstructionsOrReview: React.FC<Props> = ({ userId, selectedMovie, reviews, onReviewDeleted }) => {
  // Look for an existing review from this user for the selected movie.
  const existingReview = reviews.find((r) => r.userId === userId && selectedMovie && r.movieId === selectedMovie.id);

  // If an existing review is found, display it with a delete button.
  const handleDelete = useCallback(async () => {
    try {
      if (!existingReview) {
        return;
      }

      console.log(existingReview);

      const res = await fetch(`${API_URL}/reviews/${existingReview.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete review");
      }
      // Notify the parent that the review was deleted by passing null.
      onReviewDeleted(null);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }, [existingReview, onReviewDeleted]);

  if (!selectedMovie) {
    return (
      <div>
        <h3>No Movie Selected</h3>
        <p>Please pick a movie from the left panel.</p>
      </div>
    );
  }

  if (!existingReview) {
    // Show an example review if no review exists.
    return (
      <div>
        <h3>Example Review</h3>
        <p>
          <strong>Rating:</strong> 7/10
        </p>
        <p>"This movie is fantastic! The storyline, acting, and visuals all come together in a memorable experience."</p>
        <p>This is an example review. Posting a new review will replace this example.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Current Review</h3>
      <p>
        <strong>Rating:</strong> {existingReview.rating}/10
      </p>
      <p>{existingReview.comment}</p>
      <br />
      <p>Deleting your review will permanently remove it from the site.</p>
      <button onClick={handleDelete}>Delete Review</button>
    </div>
  );
};

export default InstructionsOrReview;
