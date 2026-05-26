import { render, screen } from '@testing-library/react'
import DeviceBreakdown from '../components/DeviceBreakdown'

describe('DeviceBreakdown', () => {
  const mockData = {
    mobile: { clicks: 500, impressions: 20000, ctr: 0.025, position: 8.5 },
    desktop: { clicks: 300, impressions: 15000, ctr: 0.02, position: 6.2 },
    tablet: { clicks: 50, impressions: 3000, ctr: 0.0167, position: 10.1 },
  }

  it('renders all three device types', () => {
    render(<DeviceBreakdown data={mockData} loading={false} />)

    expect(screen.getByText(/Mobil/)).toBeInTheDocument()
    expect(screen.getByText(/Desktop/)).toBeInTheDocument()
    expect(screen.getByText(/Tablet/)).toBeInTheDocument()
  })

  it('renders mobile metrics', () => {
    render(<DeviceBreakdown data={mockData} loading={false} />)

    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('renders CTR as percentage', () => {
    render(<DeviceBreakdown data={mockData} loading={false} />)

    // CTR 0.025 * 100 = 2.50%
    expect(screen.getByText('2.50%')).toBeInTheDocument()
  })

  it('shows empty state when data is null', () => {
    render(<DeviceBreakdown data={null} loading={false} />)
    expect(screen.getByText(/Henüz cihaz verisi/)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<DeviceBreakdown data={null} loading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
