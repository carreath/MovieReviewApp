import React, { useCallback, useEffect, useState } from "react";
import BadReviews from "../components/BadReviews";
import GoodReviews from "../components/GoodReviews";
import InstructionsOrReview from "../components/InstructionsOrReview";
import MovieSelection from "../components/MovieSelection";
import ReviewForm from "../components/ReviewForm";
import StatsView from "../components/StatsView";
import { Movie, Review } from "../types";

function HomePage(props: { user: any }) {
  // For simplicity, assume userId is always "1"
  const [userId, setUserId] = useState<number>(props?.user?.id || 1);

  // Track which movie is selected
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // All reviews for the selected movie
  const [reviews, setReviews] = useState<Review[]>([]);

  // Function to refetch reviews for the selected movie
  const [refetch, setRefetch] = useState<Function>(() => () => {});

  // After the user creates/updates a review, re-fetch or update local state
  const handleReviewCreatedOrUpdated = (newReview: Review | null) => {
    if (newReview) {
      // If this is a new review, add it. If it's an updated one, replace.
      setReviews((prev) => {
        const existingIndex = prev.findIndex((r) => r.id === newReview.id);
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = newReview;
          return updated;
        } else {
          // Add new
          return [...prev, newReview];
        }
      });
    } else {
      refetch();
    }
  };

  const onFetchReviews = useCallback(
    (fetchedReviews: Review[], refetch: Function) => {
      setReviews(fetchedReviews);
      setRefetch((oldVal) => {
        return refetch;
      });
    },
    [setReviews]
  );

  useEffect(() => {
    setUserId(props?.user?.id || 1);
  }, [props]);

  return (
    <>
      <div className="top-row">
        <MovieSelection
          userId={userId}
          selectedMovie={selectedMovie}
          onSelectMovie={(movie) => {
            setSelectedMovie(movie);
          }}
          onFetchReviews={onFetchReviews}
        />
        <ReviewForm userId={userId} selectedMovie={selectedMovie} onReviewCreatedOrUpdated={handleReviewCreatedOrUpdated} />
        <InstructionsOrReview userId={userId} selectedMovie={selectedMovie} reviews={reviews} onReviewDeleted={handleReviewCreatedOrUpdated} />
      </div>

      <div className="bottom-row">
        <StatsView selectedMovie={selectedMovie} reviews={reviews} />
        <GoodReviews reviews={reviews} />
        <BadReviews reviews={reviews} />
      </div>
    </>
  );
}

export default HomePage;
