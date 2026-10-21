import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CourseCard, ProgressBar, Button, Input } from '../components/UI';

const course = {
  id: '101', title: 'React Fundamentals', category: 'Programming', level: 'Beginner',
  description: 'Learn React components and hooks.', duration: 5, instructor: 'Alex Kumar'
};

test('renders course card details and calls the open handler', () => {
  const onOpen = jest.fn();
  render(<CourseCard course={course} onOpen={onOpen} />);
  expect(screen.getByRole('heading', { name: 'React Fundamentals' })).toBeInTheDocument();
  expect(screen.getByText(/Alex Kumar/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /view course/i }));
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('renders progress with accessible percentage', () => {
  render(<ProgressBar value={45} />);
  expect(screen.getByLabelText('Progress 45%')).toBeInTheDocument();
});

test('reusable button responds to click', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Enroll</Button>);
  fireEvent.click(screen.getByRole('button', { name: 'Enroll' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('input exposes its label and accepts typing', () => {
  render(<Input label="Student email" type="email" />);
  const field = screen.getByLabelText('Student email');
  fireEvent.change(field, { target: { value: 'student@example.com' } });
  expect(field).toHaveValue('student@example.com');
});
