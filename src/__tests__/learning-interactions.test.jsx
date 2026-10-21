import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Quiz from '../pages/Quiz';
import Assignment from '../pages/Assignment';

const mockContext = {
  enrollments: [{ id: 'e1', courseId: '101', progress: 0 }],
  courses: [{ id: '101', title: 'React Fundamentals' }],
  submitQuiz: jest.fn().mockResolvedValue({}),
  submitAssignment: jest.fn().mockResolvedValue({}),
  refreshEnrollments: jest.fn().mockResolvedValue([])
};
jest.mock('../context/LearningContext', () => ({ useLearningContext: () => mockContext }));
jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useNavigate: () => jest.fn() }));
jest.mock('../services/api', () => ({ api: { post: jest.fn() } }));

beforeEach(() => { jest.clearAllMocks(); });

test('quiz validates unanswered questions and submits answers with a score', async () => {
  render(<Quiz />);
  fireEvent.click(screen.getByRole('button', { name: /submit quiz/i }));
  expect(screen.getByText(/answer every question/i)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('useState'));
  fireEvent.click(screen.getByLabelText('HTTP'));
  fireEvent.click(screen.getByLabelText('HTML-like syntax in JavaScript'));
  fireEvent.click(screen.getByRole('button', { name: /submit quiz/i }));
  await waitFor(() => expect(mockContext.submitQuiz).toHaveBeenCalled());
  expect(await screen.findByText(/quiz submitted/i)).toBeInTheDocument();
});

test('assignment validates short submissions and accepts a valid response', async () => {
  render(<Assignment />);
  const field = screen.getByLabelText(/your submission/i);
  fireEvent.change(field, { target: { value: 'short' } });
  fireEvent.submit(field.closest('form'));
  expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'I learned how React components work.' } });
  fireEvent.click(screen.getByRole('button', { name: /submit assignment/i }));
  await waitFor(() => expect(mockContext.submitAssignment).toHaveBeenCalled());
  expect(await screen.findByText(/submitted successfully/i)).toBeInTheDocument();
});
