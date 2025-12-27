import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { AuthContext, type AuthContextType } from '../../../context/authContextDef';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = (authOverrides: Partial<AuthContextType> = {}) => {
  const defaultAuthValue: AuthContextType = {
    user: null,
    firebaseUser: null,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    logOut: jest.fn(),
    clearError: jest.fn(),
    ...authOverrides,
  };

  return {
    ...render(
      <AuthContext.Provider value={defaultAuthValue}>
        <LoginPage />
      </AuthContext.Provider>
    ),
    authValue: defaultAuthValue,
  };
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the login page with title', () => {
      renderLoginPage();

      expect(screen.getByText('FlowDiagram')).toBeInTheDocument();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should render email and password inputs', () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should render sign in button by default', () => {
      renderLoginPage();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render toggle to sign up mode', () => {
      renderLoginPage();

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Create one')).toBeInTheDocument();
    });
  });

  describe('Toggle Between Sign In and Sign Up', () => {
    it('should show confirm password field in sign up mode', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      expect(screen.getByText('Confirm Password')).toBeInTheDocument();
    });

    it('should show role selection in sign up mode', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      expect(screen.getByText('Account Type')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('should switch back to sign in mode', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));
      await user.click(screen.getByText('Sign in'));

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show error when password is less than 6 characters', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), '12345');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should show error when passwords do not match in sign up mode', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'differentpassword');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call signIn with email and password on sign in', async () => {
      const signInMock = jest.fn().mockResolvedValue(undefined);
      renderLoginPage({ signIn: signInMock });
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should call signUp with email, password, and role on sign up', async () => {
      const signUpMock = jest.fn().mockResolvedValue(undefined);
      renderLoginPage({ signUp: signUpMock });
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(signUpMock).toHaveBeenCalledWith('test@example.com', 'password123', 'editor');
      });
    });

    it('should navigate to dashboard on successful sign in', async () => {
      const signInMock = jest.fn().mockResolvedValue(undefined);
      renderLoginPage({ signIn: signInMock });
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to dashboard on successful sign up', async () => {
      const signUpMock = jest.fn().mockResolvedValue(undefined);
      renderLoginPage({ signUp: signUpMock });
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Role Selection', () => {
    it('should default to editor role', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      const editorButton = screen.getByText('Editor').closest('button');
      expect(editorButton).toHaveClass('border-primary-500');
    });

    it('should allow selecting viewer role', async () => {
      const signUpMock = jest.fn().mockResolvedValue(undefined);
      renderLoginPage({ signUp: signUpMock });
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));
      await user.click(screen.getByText('Viewer'));

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      
      const passwordFields = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordFields[0], 'password123');
      await user.type(passwordFields[1], 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(signUpMock).toHaveBeenCalledWith('test@example.com', 'password123', 'viewer');
      });
    });

    it('should allow switching between editor and viewer roles', async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));
      
      await user.click(screen.getByText('Viewer'));
      const viewerButton = screen.getByText('Viewer').closest('button');
      expect(viewerButton).toHaveClass('border-primary-500');

      await user.click(screen.getByText('Editor'));
      const editorButton = screen.getByText('Editor').closest('button');
      expect(editorButton).toHaveClass('border-primary-500');
    });
  });

  describe('Error Display', () => {
    it('should display auth context error', () => {
      renderLoginPage({ error: 'Invalid credentials' });

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should clear error when switching modes', async () => {
      const clearErrorMock = jest.fn();
      renderLoginPage({ error: 'Some error', clearError: clearErrorMock });
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));

      expect(clearErrorMock).toHaveBeenCalled();
    });

    it('should clear error when switching back to sign in mode', async () => {
      const clearErrorMock = jest.fn();
      renderLoginPage({ clearError: clearErrorMock });
      const user = userEvent.setup();

      await user.click(screen.getByText('Create one'));
      await user.click(screen.getByText('Sign in'));

      expect(clearErrorMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Clear Error on Submit', () => {
    it('should call clearError when submitting form', async () => {
      const clearErrorMock = jest.fn();
      renderLoginPage({ clearError: clearErrorMock });
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(clearErrorMock).toHaveBeenCalled();
    });
  });
});
