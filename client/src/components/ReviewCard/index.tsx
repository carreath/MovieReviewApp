import React, { useState, useEffect } from "react";
import { Review } from "../../types";
import "./ReviewCard.css";
import { API_URL } from "../../App";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/users/${review.userId}`);
        if (res.ok) {
          const userData = await res.json();
          setUserName(userData.name);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, [review.userId]);

  return (
    <div className="review-card">
      <p className="review-user">
        <strong>Posted by:</strong> {userName || review.userId}
      </p>
      <p className="review-score">
        <strong>Score:</strong> {review.rating}
      </p>
      <pre
        className="review-comment"
        style={{
          maxWidth: "100%",
        }}>
        {review.comment}
      </pre>
    </div>
  );
};

export default ReviewCard;
