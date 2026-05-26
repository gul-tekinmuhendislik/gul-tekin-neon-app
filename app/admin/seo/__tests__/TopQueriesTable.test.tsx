import { render, screen } from '@testing-library/react'
import TopQueriesTable from '../components/TopQueriesTable'

describe('TopQueriesTable', () => {
  const mockData = [
    { query: 'su deposu bodrum', clicks: 100, impressions: 5000, ctr: 2.0, position: 3.5 },
    { query: 'hidrofor fiyatları', clicks: 80, impressions: 3000, ctr: 2.67, position: 5.2 },
    { query: 'ısı pompası', clicks: 60, impressions: 2000, ctr: 3.0, position: 4.1 },
  ]

  it('renders query data rows', () => {
    render(<TopQueriesTable data={mockData} loading={false} />)

    expect(screen.getByText('su deposu bodrum')).toBeInTheDocument()
    expect(screen.getByText('hidrofor fiyatları')).toBeInTheDocument()
    expect(screen.getByText('ısı pompası')).toBeInTheDocument()
  })

  it('renders formatted metrics', () => {
    render(<TopQueriesTable data={mockData} loading={false} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('5.000')).toBeInTheDocument() // LOCALE: tr-TR
    expect(screen.getByText('3.5')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<TopQueriesTable data={[]} loading={false} />)
    expect(screen.getByText(/Henüz sorgu verisi/)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<TopQueriesTable data={[]} loading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
