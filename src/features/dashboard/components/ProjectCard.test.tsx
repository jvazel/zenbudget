import { render, screen } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('ProjectCard', () => {
    const mockProps = {
        title: 'Maison',
        current: 10000,
        target: 50000,
        category: 'Immobilier'
    }

    it('renders project details correctly', () => {
        render(<ProjectCard {...mockProps} />)
        expect(screen.getByText('Maison')).toBeInTheDocument()
        expect(screen.getByText('Immobilier')).toBeInTheDocument()
    })

    it('calculates and displays percentage', () => {
        render(<ProjectCard {...mockProps} />)
        // 10000 / 50000 = 20%
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('displays formatted amounts', () => {
        render(<ProjectCard {...mockProps} />)
        // Check for presence of formatted numbers (flexible regex for locale spaces)
        expect(screen.getByText(/10[\s\u202f\u00a0]*000€/)).toBeInTheDocument()
        expect(screen.getByText(/50[\s\u202f\u00a0]*000€/)).toBeInTheDocument()
    })
})
