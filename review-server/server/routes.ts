import { Application } from 'express';
import devToolsRouter from './api/controllers/devTools/router';
import reviewsRouter from './api/controllers/reviews/router';
import movieRouter from './api/controllers/movies/router';
import userRouter from './api/controllers/users/router';

export default function routes(app: Application): void {
  app.use('/api/v1/dev', devToolsRouter);
  app.use('/api/v1/reviews', reviewsRouter);
  app.use('/api/v1/movies', movieRouter);
  app.use('/api/v1/users', userRouter);
}
