import React from "react";

interface Review {
  id: number;
  title: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loading }) => {
  return (
    <section className="reviews-list-section">
      <h2>Movie Reviews</h2>
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet. Be the first to add one!</p>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h3>{review.title}</h3>
              <div className="rating">Rating: {review.rating}/10</div>
              {review.comment && <p className="comment">{review.comment}</p>}
              <div className="date">{new Date(review.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsList;
