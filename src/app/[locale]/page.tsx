import { Locale, locales } from '../../i18n';
import { getAllReviews } from '../../lib/markdown';
import Link from 'next/link';
import Image from 'next/image';
import ClientScrollWrapper from '../../components/ClientScrollWrapper';

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

// Function to get rating icon based on score
function getRatingIcon(score: number): string {
  if (score >= 9.0) {
    return '🔥'; // 9+ (第一档): fire icon for best books
  } else if (score >= 8.0) {
    return '👍'; // 8-9 (第二档): thumbs up for excellent books
  } else if (score >= 6.0) {
    return '💭'; // 6-8 (第三档): thought bubble for good books
  } else {
    return '👎'; // <6 (第四档): thumbs down for poor books
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const reviews = getAllReviews(locale);
  return (
    <>
      <ClientScrollWrapper />
      <div className="grid">
        {reviews.map((review, index) => (
          <div key={review.slug} className="book-item">
            <div className="book-cover-container">
              <Link href={`/${locale}/review/${review.slug}`} className="cover-link">
                <Image 
                  src={review.cover} 
                  alt={review.title} 
                  width={128} 
                  height={192} 
                  className="book-cover"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </Link>
              <div className="book-rating">
                <span className="rating-score">
                  {review.score}
                  <span className="rating-icon">{getRatingIcon(review.score)}</span>
                </span>
              </div>
            </div>
            <Link href={`/${locale}/review/${review.slug}`} className="title-link">
              <h2 className="book-title">{review.title}</h2>
            </Link>
            <p className="book-author">{review.author}</p>
          </div>
        ))}
      </div>
    </>
  );
}
