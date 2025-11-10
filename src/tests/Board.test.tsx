import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BoardPage from '@/app/board/page';
import { useAuth } from '@/context/AuthContext';
import { useBoard } from '@/context/BoardContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/board'),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/BoardContext', () => ({
  useBoard: jest.fn(),
}));

describe('Board Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('redirects to login when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(<BoardPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('shows loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    (useBoard as jest.Mock).mockReturnValue({
      currentBoard: null,
      boards: [],
      loading: true,
      error: null,
      setCurrentBoard: jest.fn(),
      loadBoards: jest.fn(),
      loadBoard: jest.fn(),
      loadCurrentBoard: jest.fn(),
      createBoard: jest.fn(),
      updateBoard: jest.fn(),
      deleteBoard: jest.fn(),
      createColumn: jest.fn(),
      updateColumn: jest.fn(),
      deleteColumn: jest.fn(),
      createCard: jest.fn(),
      updateCard: jest.fn(),
      deleteCard: jest.fn(),
      moveCard: jest.fn(),
    });

    render(<BoardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays board when loaded', async () => {
    const mockBoard = {
      id: '1',
      name: 'Test Board',
      columns: [
        {
          id: 'col1',
          name: 'To Do',
          cards: [],
        },
      ],
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });
    (useBoard as jest.Mock).mockReturnValue({
      currentBoard: mockBoard,
      boards: [],
      loading: false,
      error: null,
      setCurrentBoard: jest.fn(),
      loadBoards: jest.fn(),
      loadBoard: jest.fn(),
      loadCurrentBoard: jest.fn(),
      createBoard: jest.fn(),
      updateBoard: jest.fn(),
      deleteBoard: jest.fn(),
      createColumn: jest.fn(),
      updateColumn: jest.fn(),
      deleteColumn: jest.fn(),
      createCard: jest.fn(),
      updateCard: jest.fn(),
      deleteCard: jest.fn(),
      moveCard: jest.fn(),
    });

    render(<BoardPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Board')).toBeInTheDocument();
    });
  });
});

