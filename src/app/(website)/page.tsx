import { sanityFetch } from '@/sanity/lib/live';
import { urlFor } from '@/sanity/lib/image';

import HeroSlides from '@/components/HeroSlides';
import InsideDome from '@/components/InsideDome';
import Packages, { DomePackage } from '@/components/Packages';
import FindUs from '@/components/FindUs';
import ReviewsStrip, { Review } from '@/components/ReviewsStrip';
import Footer from '@/components/Footer';

// Dynamic Queries
const SLIDES_QUERY = `*[_type == "heroSection"] | order(order asc) {
  _id,
  title,
  subtitle,
  italicText,
  currentImage,
  nextImage,
  badgeText,
  isFirst,
  showButtons,
  order
}`;

const PACKAGES_QUERY = `*[_type == "domePackage"] | order(order asc) {
  _id,
  name,
  price,
  duration,
  features,
  tag,
  order
}`;

const REVIEWS_QUERY = `*[_type == "review"] | order(_createdAt desc) {
  _id,
  name,
  text,
  stars
}`;

// Fallbacks
const fallbackSlides = [
  {
    _id: 'fallback-1',
    title: 'DOME CAFE',
    subtitle: 'Hyderabad',
    italicText: "India's first dome-shaped celebration café",
    currentImage: '/images/dome.png',
    nextImage: '/images/birthday_v3.png',
    isFirst: true,
  },
  {
    _id: 'fallback-2',
    title: 'CELEBRATE YOUR BIRTHDAY',
    subtitle: 'Private dome · Balloon décor · LED signs',
    currentImage: '/images/birthday_v3.png',
    nextImage: '/images/anniversary.png',
    badgeText: '✦ Packages from ₹999 ✦',
  },
  {
    _id: 'fallback-3',
    title: 'YOU LOVE MOST',
    subtitle: 'Anniversaries · Gender Reveals · Romantic Dinners',
    italicText: 'FOR THE ONES',
    currentImage: '/images/anniversary.png',
    nextImage: '/images/genderreveal_v2.png',
    showButtons: true,
  },
  {
    _id: 'fallback-4',
    title: 'REVEAL',
    subtitle: 'Magical gender reveal celebrations',
    italicText: 'THE BIG',
    currentImage: '/images/genderreveal_v2.png',
    nextImage: '/images/celebrations.png',
  },
  {
    _id: 'fallback-5',
    title: 'ANY OCCASION',
    subtitle: 'BIRTHDAYS · FAREWELLS · GET-TOGETHERS',
    italicText: 'For Every Occasion',
    currentImage: '/images/celebrations.png',
    nextImage: '/images/celebrations.png',
    showButtons: true,
  },
];

export default async function Page() {
  // Fetch Slides
  let slides = [];
  try {
    const { data: sanitySlides } = await sanityFetch({ query: SLIDES_QUERY }) as { data: any[] };
    if (sanitySlides && sanitySlides.length > 0) {
      slides = sanitySlides.map((slide: any) => ({
        ...slide,
        currentImage: slide.currentImage ? urlFor(slide.currentImage).url() : '/images/dome.png',
        nextImage: slide.nextImage ? urlFor(slide.nextImage).url() : '/images/birthday_v3.png',
      }));
    } else {
      slides = fallbackSlides;
    }
  } catch (error) {
    console.error('Error fetching slides from Sanity:', error);
    slides = fallbackSlides;
  }

  // Fetch Packages
  let packages: DomePackage[] = [];
  try {
    const { data: sanityPackages } = await sanityFetch({ query: PACKAGES_QUERY }) as { data: any[] };
    if (sanityPackages && sanityPackages.length > 0) {
      packages = sanityPackages;
    }
  } catch (error) {
    console.error('Error fetching packages from Sanity:', error);
  }

  // Fetch Reviews
  let reviews: Review[] = [];
  try {
    const { data: sanityReviews } = await sanityFetch({ query: REVIEWS_QUERY }) as { data: any[] };
    if (sanityReviews && sanityReviews.length > 0) {
      reviews = sanityReviews;
    }
  } catch (error) {
    console.error('Error fetching reviews from Sanity:', error);
  }

  return (
    <main style={{ paddingTop: '0' }}>
      <HeroSlides slides={slides} />
      <InsideDome />
      <Packages packages={packages} />
      <FindUs />
      <ReviewsStrip reviews={reviews} />
      <Footer />
    </main>
  );
}
