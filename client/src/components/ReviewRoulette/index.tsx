import React, { useState, useRef, useEffect } from "react";
import { Movie, Review } from "../../types";

interface ReviewRouletteProps {
  userId: number;
  selectedMovie: Movie | null;
  reviews?: Review[];
  onReviewCreatedOrUpdated: (review: Review) => void;
  apiUrl: string;
}

const ReviewRoulette: React.FC<ReviewRouletteProps> = ({ userId, selectedMovie, reviews = [], onReviewCreatedOrUpdated, apiUrl }) => {
  const [offset, setOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTime = useRef<number>(0);
  const lastY = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch reviews for the selected movie
  useEffect(() => {
    const fetchMovieReviews = async () => {
      if (!selectedMovie) return;

      try {
        const response = await fetch(`${apiUrl}/movies/reviews/${selectedMovie.id}`);
        if (response.ok) {
          const movieData = await response.json();
          // Find the matching reviews from all reviews
          const movieReviews = reviews.filter((review) => review.movieId === selectedMovie.id);
          setFilteredReviews(movieReviews);

          // Set current index to the user's review if it exists
          const userReviewIndex = movieReviews.findIndex((r) => r.userId === userId);
          if (userReviewIndex >= 0) {
            setCurrentIndex(userReviewIndex);
          } else {
            setCurrentIndex(0);
          }
        } else {
          console.error("Failed to fetch movie reviews");
        }
      } catch (error) {
        console.error("Error fetching movie reviews:", error);
      }
    };

    fetchMovieReviews();
  }, [selectedMovie, reviews, userId, apiUrl]);

  // Handle animation loop
  const animate = (timestamp: number) => {
    if (!isDragging) {
      // Apply friction to slow down
      const friction = 0.95;
      setVelocity((prev) => prev * friction);

      // Update offset based on velocity
      setOffset((prev) => {
        const newOffset = prev + velocity;

        // Calculate bounds for the offset to prevent scrolling too far
        const maxOffset = (filteredReviews.length - 1) * 100;
        if (newOffset < 0) return 0;
        if (newOffset > maxOffset) return maxOffset;
        return newOffset;
      });

      // Update current index based on offset
      const newIndex = Math.round(offset / 100);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredReviews.length) {
        setCurrentIndex(newIndex);
      }

      // Stop animation if velocity is very small
      if (Math.abs(velocity) < 0.5) {
        setVelocity(0);
        // Snap to closest review
        setOffset(currentIndex * 100);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Start/stop animation
  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.5 && !animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isDragging, velocity]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    lastY.current = e.clientY;
    lastTime.current = Date.now();
    setVelocity(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaY = lastY.current - e.clientY;
      const now = Date.now();
      const deltaTime = now - lastTime.current;

      // Update velocity
      if (deltaTime > 0) {
        setVelocity((deltaY / deltaTime) * 10); // Adjust sensitivity
      }

      // Update offset
      setOffset((prev) => {
        const newOffset = prev + deltaY / 2; // Adjust sensitivity
        // Enforce boundaries
        if (newOffset < 0) return 0;
        if (newOffset > (filteredReviews.length - 1) * 100) return (filteredReviews.length - 1) * 100;
        return newOffset;
      });

      // Update current index
      const newIndex = Math.round(offset / 100);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredReviews.length) {
        setCurrentIndex(newIndex);
      }

      lastY.current = e.clientY;
      lastTime.current = now;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Snap to closest review
    const targetIndex = Math.round(offset / 100);
    setOffset(targetIndex * 100);
    setCurrentIndex(targetIndex);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    lastY.current = e.touches[0].clientY;
    lastTime.current = Date.now();
    setVelocity(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const deltaY = lastY.current - e.touches[0].clientY;
      const now = Date.now();
      const deltaTime = now - lastTime.current;

      // Update velocity
      if (deltaTime > 0) {
        setVelocity((deltaY / deltaTime) * 10);
      }

      // Update offset
      setOffset((prev) => {
        const newOffset = prev + deltaY / 2;
        if (newOffset < 0) return 0;
        if (newOffset > (filteredReviews.length - 1) * 100) return (filteredReviews.length - 1) * 100;
        return newOffset;
      });

      lastY.current = e.touches[0].clientY;
      lastTime.current = now;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to closest review
    const targetIndex = Math.round(offset / 100);
    setOffset(targetIndex * 100);
    setCurrentIndex(targetIndex);
  };

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove as any);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove as any, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  // Calculate which reviews should be visible (current + 2 above + 2 below)
  const visibleReviews = () => {
    if (filteredReviews.length === 0) return [];

    const result = [];
    for (let i = currentIndex - 2; i <= currentIndex + 2; i++) {
      if (i >= 0 && i < filteredReviews.length) {
        result.push({
          review: filteredReviews[i],
          position: i - currentIndex,
        });
      }
    }
    return result;
  };

  return (
    <div className="review-roulette">
      <h3 className="text-xl font-bold mb-4">Review Roulette</h3>

      {!selectedMovie ? (
        <div className="empty-state p-8 bg-gray-100 rounded-lg text-center text-gray-500">Please select a movie to see reviews</div>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state p-8 bg-gray-100 rounded-lg text-center text-gray-500">No reviews available for this movie</div>
      ) : (
        <div
          ref={containerRef}
          className="roulette-container relative h-96 overflow-hidden bg-gray-50 rounded-lg shadow-md"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}>
          <div className="center-indicator absolute left-0 right-0 top-1/2 h-24 transform -translate-y-1/2 bg-blue-100 border-y-2 border-blue-300 z-10"></div>

          <div
            className="reviews-wrapper absolute left-0 right-0 w-full transition-transform duration-100"
            style={{
              transform: `translateY(${-offset + 192}px)`, // 192px = 50% of container - half review height
            }}>
            {visibleReviews().map(({ review, position }) => (
              <div
                key={review.id}
                className={`review-card p-4 mx-4 h-24 mb-2 rounded-lg shadow ${position === 0 ? "bg-white font-medium z-20" : "bg-gray-200"}`}
                style={{
                  opacity: Math.max(0, 1 - Math.abs(position) * 0.3),
                  transform: `scale(${1 - Math.abs(position) * 0.1})`,
                }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="rating-star text-yellow-500 text-xl mr-1">★</span>
                    <span className="font-bold text-lg">{review.rating}</span>
                    <span className="text-xs text-gray-500 ml-4">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="comment mt-2 overflow-hidden text-sm">
                  {review.comment.length > 100 ? `${review.comment.substring(0, 100)}...` : review.comment}
                </div>
              </div>
            ))}
          </div>

          <div className="drag-indicator absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm">Drag up or down to see more reviews</div>
        </div>
      )}

      {filteredReviews.length > 0 && currentIndex >= 0 && currentIndex < filteredReviews.length && (
        <div className="selected-review-details mt-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg">Selected Review</h4>
            <div className="rating flex items-center">
              <span className="rating-star text-yellow-500 text-2xl mr-1">★</span>
              <span className="font-bold text-xl">{filteredReviews[currentIndex].rating}</span>
            </div>
          </div>
          <p className="comment text-gray-800">{filteredReviews[currentIndex].comment}</p>
          <div className="text-xs text-gray-500 mt-4">{new Date(filteredReviews[currentIndex].date).toLocaleDateString()}</div>
        </div>
      )}
    </div>
  );
};

export default ReviewRoulette;
