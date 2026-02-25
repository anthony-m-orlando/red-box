import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaperContainer from './PaperContainer';

describe('PaperContainer Component', () => {
  it('should render children', () => {
    render(<PaperContainer>Test Content</PaperContainer>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    const { container, rerender } = render(
      <PaperContainer variant="cream">Content</PaperContainer>
    );
    expect(container.querySelector('.paper-cream')).toBeInTheDocument();
    
    rerender(<PaperContainer variant="aged">Content</PaperContainer>);
    expect(container.querySelector('.paper-aged')).toBeInTheDocument();
    
    rerender(<PaperContainer variant="graph">Content</PaperContainer>);
    expect(container.querySelector('.paper-graph')).toBeInTheDocument();
    
    rerender(<PaperContainer variant="lined">Content</PaperContainer>);
    expect(container.querySelector('.paper-lined')).toBeInTheDocument();
  });

  it('should apply padding classes', () => {
    const { container, rerender } = render(
      <PaperContainer padding="sm">Content</PaperContainer>
    );
    expect(container.querySelector('.paper-padding-sm')).toBeInTheDocument();
    
    rerender(<PaperContainer padding="md">Content</PaperContainer>);
    expect(container.querySelector('.paper-padding-md')).toBeInTheDocument();
    
    rerender(<PaperContainer padding="lg">Content</PaperContainer>);
    expect(container.querySelector('.paper-padding-lg')).toBeInTheDocument();
  });

  it('should not apply padding class when padding is none', () => {
    const { container } = render(
      <PaperContainer padding="none">Content</PaperContainer>
    );
    expect(container.querySelector('[class*="paper-padding"]')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PaperContainer className="custom-class">Content</PaperContainer>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should apply default variant and padding', () => {
    const { container } = render(<PaperContainer>Content</PaperContainer>);
    expect(container.querySelector('.paper-cream')).toBeInTheDocument();
    expect(container.querySelector('.paper-padding-md')).toBeInTheDocument();
  });
});
