import { render, screen } from '@testing-library/react'
import { ZenGauge } from './ZenGauge'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('ZenGauge', () => {
    it('renders the correct formatted value', () => {
        render(<ZenGauge value={1250.50} total={3000} />)
        expect(screen.getByText(/1[\s\u202f\u00a0]*250[,.]50/)).toBeInTheDocument()
    })

    it('displays Reste à Vivre label', () => {
        render(<ZenGauge value={1000} total={3000} />)
        expect(screen.getByText('Reste à Vivre')).toBeInTheDocument()
    })

    // Note: Testing styles specifically usually requires checking classes or computed styles
    // Here we check if the text has the correct color class based on the logic
    it('uses normal color when percentage is healthy', () => {
        render(<ZenGauge value={1500} total={3000} />) // 50%
        const valueText = screen.getByText(/1[\s\u202f\u00a0]*500[,.]00/)
        expect(valueText).toHaveClass('text-white')
    })

    it('uses critical color when percentage is low', () => {
        render(<ZenGauge value={100} total={3000} />) // 3.3% (< 10%)
        const valueText = screen.getByText(/100,00/)
        expect(valueText).toHaveClass('text-red-400')
    })
})
