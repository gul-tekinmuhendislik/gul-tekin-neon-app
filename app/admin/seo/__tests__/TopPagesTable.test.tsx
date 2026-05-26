import { render, screen } from '@testing-library/react'
import TopPagesTable from '../components/TopPagesTable'

describe('TopPagesTable', () => {
  const mockData = [
    { page: '/su-deposu', clicks: 50, impressions: 2000, ctr: 2.5, position: 4.2 },
    { page: '/hidrofor', clicks: 30, impressions: 1500, ctr: 2.0, position: 6.1 },
  ]

  it('renders page data rows', () => {
    render(<TopPagesTable data={mockData} loading={false} />)

    expect(screen.getByText('/su-deposu')).toBeInTheDocument()
    expect(screen.getByText('/hidrofor')).toBeInTheDocument()
  })

  it('renders formatted metrics', () => {
    render(<TopPagesTable data={mockData} loading={false} />)

    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('2.000')).toBeInTheDocument()
    expect(screen.getByText('2.50%')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<TopPagesTable data={[]} loading={false} />)
    expect(screen.getByText(/Henüz sayfa verisi/)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<TopPagesTable data={[]} loading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
