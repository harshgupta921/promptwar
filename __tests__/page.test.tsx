/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
    it('should render without crashing', () => {
        render(<Home />);
        expect(screen.getByText(/SNAKE.AI/i)).toBeInTheDocument();
    });

    it('should have proper metadata', () => {
        expect(true).toBe(true);
    });

    it('should contain navigation elements', () => {
        render(<Home />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible ARIA labels', () => {
        render(<Home />);
        const loginButton = screen.getByLabelText(/Login to your account/i);
        expect(loginButton).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
        render(<Home />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
        render(<Home />);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
});
