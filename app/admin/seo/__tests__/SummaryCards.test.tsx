import { render, screen } from '@testing-library/react'
import SummaryCards from '../components/SummaryCards'

describe('SummaryCards', () => {
  const mockData = {
    clicks: 1234,
    impressions: 56789,
    ctr: 3.45,
    position: 12.3,
  }

  it('renders all metric cards with data', () => {
    render(<SummaryCards data={mockData} loading={false} />)

    expect(screen.getByText('Toplam Tıklama')).toBeInTheDocument()
    expect(screen.getByText('1.234')).toBeInTheDocument()

    expect(screen.getByText('Gösterim')).toBeInTheDocument()
    expect(screen.getByText('56.789')).toBeInTheDocument()

    expect(screen.getByText('CTR')).toBeInTheDocument()
    expect(screen.getByText('3.45%')).toBeInTheDocument()

    expect(screen.getByText('Ort. Pozisyon')).toBeInTheDocument()
    expect(screen.getByText('12.3')).toBeInTheDocument()
  })

  it('renders zeros when data is null', () => {
    render(<SummaryCards data={null} loading={false} />)

    expect(screen.getByText('Toplam Tıklama')).toBeInTheDocument()
    expect(screen.getByText('Gösterim')).toBeInTheDocument()
    expect(screen.getByText('CTR')).toBeInTheDocument()
    expect(screen.getByText('Ort. Pozisyon')).toBeInTheDocument()
    // Two cards (clicks and impressions) show 0, CTR shows 0.00%, pos shows 0.0
    expect(screen.getByText('0.00%')).toBeInTheDocument()
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<SummaryCards data={null} loading={true} />)
    // Should have animate-pulse elements
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
