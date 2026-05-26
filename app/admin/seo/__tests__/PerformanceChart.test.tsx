import { render, screen } from '@testing-library/react'
import PerformanceChart from '../components/PerformanceChart'

describe('PerformanceChart', () => {
  const mockData = [
    { date: '2026-05-01', clicks: 10, impressions: 500, ctr: 0.02, position: 8.5 },
    { date: '2026-05-02', clicks: 15, impressions: 600, ctr: 0.025, position: 7.2 },
    { date: '2026-05-03', clicks: 8, impressions: 400, ctr: 0.02, position: 9.1 },
  ]

  it('renders chart title correctly for clicks metric', () => {
    render(<PerformanceChart data={mockData} metric="clicks" loading={false} />)
    expect(screen.getByText('Tıklama Trendi')).toBeInTheDocument()
  })

  it('renders chart title correctly for impressions metric', () => {
    render(<PerformanceChart data={mockData} metric="impressions" loading={false} />)
    expect(screen.getByText('Gösterim Trendi')).toBeInTheDocument()
  })

  it('renders chart title correctly for ctr metric', () => {
    render(<PerformanceChart data={mockData} metric="ctr" loading={false} />)
    expect(screen.getByText('CTR (%) Trendi')).toBeInTheDocument()
  })

  it('renders chart title correctly for position metric', () => {
    render(<PerformanceChart data={mockData} metric="position" loading={false} />)
    expect(screen.getByText('Pozisyon Trendi')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<PerformanceChart data={[]} metric="clicks" loading={false} />)
    expect(screen.getByText(/Henüz veri bulunmuyor/)).toBeInTheDocument()
  })

  it('renders date labels', () => {
    render(<PerformanceChart data={mockData} metric="clicks" loading={false} />)
    // Should show first, middle, and last dates
    expect(screen.getByText('1 May')).toBeInTheDocument()
    expect(screen.getByText('3 May')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<PerformanceChart data={[]} metric="clicks" loading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
