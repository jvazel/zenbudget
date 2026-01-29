import { render, screen } from '@testing-library/react'
import { ZenSuccessState } from './ZenSuccessState'
import { describe, it, expect } from 'vitest'
import React from 'react'

describe('ZenSuccessState', () => {
    it('renders success message', () => {
        render(<ZenSuccessState />)
        expect(screen.getByText('Inbox Zero !')).toBeInTheDocument()
        expect(screen.getByText(/Esprit Calme/)).toBeInTheDocument()
    })

    it('shows redirection clue', () => {
        render(<ZenSuccessState />)
        expect(screen.getByText('Redirection vers le Dashboard...')).toBeInTheDocument()
    })
})
