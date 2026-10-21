import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CourseDetail from '../pages/CourseDetail';

const mockNavigate = jest.fn();
const mockEnrollCourse = jest.fn().mockResolvedValue({});
const mockRefreshEnrollments = jest.fn().mockResolvedValue([]);
const mockCourse = {
  id: '101', title: 'React Fundamentals', category: 'Programming', level: 'Beginner',
  description: 'Learn React components and hooks.', duration: 5, instructor: 'Alex Kumar', lessons: 8
};
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '101' }),
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));
jest.mock('../services/api', () => ({
  getCourse: jest.fn(() => Promise.resolve(mockCourse)),
  getMaterials: jest.fn().mockResolvedValue([{ id: 'm1', title: 'Introduction' }])
}));
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
jest.mock('../context/LearningContext', () => ({
  useLearningContext: () => ({ enrollments: [], enrollCourse: mockEnrollCourse, refreshEnrollments: mockRefreshEnrollments })
}));

test('enrolls the authenticated student and navigates to learning dashboard', async () => {
  render(<CourseDetail />);
  const button = await screen.findByRole('button', { name: /enroll in course/i });
  fireEvent.click(button);
  await waitFor(() => expect(mockEnrollCourse).toHaveBeenCalledWith('101'));
  expect(mockNavigate).toHaveBeenCalledWith('/learning');
});
