"use client";

export function FlipCard({
  frontTitle,
  frontIcon = "\u2733",
  backText,
  className = "",
}: {
  frontTitle: string;
  frontIcon?: string;
  backText: string;
  className?: string;
}) {
  return (
    <div className={`flip-card ${className}`}>
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front bg-dark-gray text-white flex flex-col items-center justify-center p-6 rounded-sm">
          <div className="w-10 h-10 mb-3 bg-gold/20 rounded-full flex items-center justify-center text-gold">
            {frontIcon}
          </div>
          <h3 className="font-heading font-semibold text-sm text-center">
            {frontTitle}
          </h3>
        </div>
        {/* Back */}
        <div className="flip-card-back bg-gold text-white flex items-center justify-center p-6 rounded-sm">
          <p className="text-sm text-center leading-relaxed">{backText}</p>
        </div>
      </div>
    </div>
  );
}
