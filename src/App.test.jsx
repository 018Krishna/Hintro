import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';

// Mock test for Login rendering
test('renders login form', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/intern@demo.com/i)).toBeInTheDocument();
});

// Mock test for input update
test('allows entering email', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
  const emailInput = screen.getByPlaceholderText(/intern@demo.com/i);
  fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
  expect(emailInput.value).toBe('test@test.com');
});