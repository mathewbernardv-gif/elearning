import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCourses } from '../hooks/useCourses';
import { getCourses } from '../services/api';

jest.mock('../services/api', () => ({ getCourses: jest.fn() }));

const courses = [
  { id: '101', title: 'React Basics', description: 'UI components', instructor: 'Anu', category: 'Programming', level: 'Beginner', duration: 4 },
  { id: '102', title: 'Network Security', description: 'Secure systems', instructor: 'Ravi', category: 'Cybersecurity', level: 'Intermediate', duration: 8 }
];

test('loads courses and filters by search, category, level, duration and instructor', async () => {
  getCourses.mockResolvedValue(courses);
  const { result } = renderHook(() => useCourses());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.filteredCourses).toHaveLength(2);
  act(() => result.current.setSearch('network'));
  expect(result.current.filteredCourses.map(c => c.id)).toEqual(['102']);
  act(() => { result.current.setSearch(''); result.current.setCategory('Programming'); });
  expect(result.current.filteredCourses.map(c => c.id)).toEqual(['101']);
  act(() => { result.current.setCategory('All'); result.current.setLevel('Beginner'); });
  expect(result.current.filteredCourses.map(c => c.id)).toEqual(['101']);
  act(() => { result.current.setLevel('All'); result.current.setMaxDuration('5'); });
  expect(result.current.filteredCourses.map(c => c.id)).toEqual(['101']);
  act(() => { result.current.setMaxDuration('All'); result.current.setInstructor('ravi'); });
  expect(result.current.filteredCourses.map(c => c.id)).toEqual(['102']);
});
