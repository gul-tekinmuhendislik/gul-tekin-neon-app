import { render, screen, fireEvent } from '@testing-library/react'
import SitemapStatus from '../components/SitemapStatus'

describe('SitemapStatus', () => {
  const mockSitemaps = [
    { path: 'https://gul-tekinmuhendislik.com/sitemap.xml', isSitemapsIndex: true },
    { path: 'https://gul-tekinmuhendislik.com/posts-sitemap.xml', isSitemapsIndex: false },
  ]

  it('renders sitemap list', () => {
    render(<SitemapStatus data={mockSitemaps} loading={false} onSync={jest.fn()} syncing={false} />)

    expect(screen.getByText('sitemap.xml')).toBeInTheDocument()
    expect(screen.getByText('posts-sitemap.xml')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<SitemapStatus data={mockSitemaps} loading={false} onSync={jest.fn()} syncing={false} />)

    expect(screen.getByText('Sitemap Gönder')).toBeInTheDocument()
  })

  it('disables submit button while syncing', () => {
    render(<SitemapStatus data={mockSitemaps} loading={false} onSync={jest.fn()} syncing={true} />)

    expect(screen.getByText('Gönderiliyor...')).toBeDisabled()
  })

  it('calls onSync when submit button is clicked', () => {
    const onSync = jest.fn()
    render(<SitemapStatus data={mockSitemaps} loading={false} onSync={onSync} syncing={false} />)

    fireEvent.click(screen.getByText('Sitemap Gönder'))
    expect(onSync).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no sitemaps', () => {
    render(<SitemapStatus data={[]} loading={false} onSync={jest.fn()} syncing={false} />)

    expect(screen.getByText(/Henüz sitemap gönderilmemiş/)).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<SitemapStatus data={[]} loading={true} onSync={jest.fn()} syncing={false} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
