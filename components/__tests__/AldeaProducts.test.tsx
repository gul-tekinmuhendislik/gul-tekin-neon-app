import React from "react";
import { render, screen } from "@testing-library/react";
import { sql } from "@/lib/db";
import AldeaProducts from "../AldeaProducts";

jest.mock("@/lib/db", () => ({
  sql: jest.fn(),
}));

jest.mock("@/lib/utils/image-optimization", () => ({
  getListingImageUrl: (url: string) => url,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} src={typeof src === "string" ? src : ""} {...props} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockSql = sql as unknown as jest.Mock;

describe("AldeaProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Aldea heat pump cards with images and product links", async () => {
    mockSql.mockResolvedValue([
      {
        id: "aldea-10kw",
        urun_adi: "Aldea Monoblok Isı Pompası 10 kW",
        slug: "aldea-monoblok-isi-pompasi-10-kw",
        cloudinary_url: "https://res.cloudinary.com/demo/image/upload/aldea-10kw.jpg",
      },
    ]);

    render(await AldeaProducts());

    expect(screen.getByRole("heading", { name: "Aldea Isı Pompaları" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Aldea Monoblok Isı Pompası 10 kW" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Aldea Monoblok Isı Pompası 10 kW/ })).toHaveAttribute(
      "href",
      "/urunler/aldea-monoblok-isi-pompasi-10-kw",
    );
  });

  it("renders nothing when there are no active Aldea heat pumps", async () => {
    mockSql.mockResolvedValue([]);

    const { container } = render(await AldeaProducts());

    expect(container).toBeEmptyDOMElement();
  });
});