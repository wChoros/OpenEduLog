import React from 'react';
import './style.sass'; // SASS file remains the same

// Define the props interface
interface SpinningLogoProps {
  logoUrl?: string;
  altText?: string;
  captionText?: string;
}

const SpinningLogo: React.FC<SpinningLogoProps> = ({
  logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj1VqbR4Yteci3jiSTheRv1yTbAbThMf2Y1g&s", // Default to the provided URL
  altText = "Spinning School Logo",
  captionText = "Leading the Future"
}) => {
  return (
    <div id="spinningLogoContainer">
      <div className="logo-card">
        <h2>School Spirit!</h2>
        <div className="logo-wrapper">
          {/* Use an img tag for the provided logo URL */}
          <img
            src={logoUrl}
            alt={altText}
            className="school-logo"
            // Add an onerror handler for fallback, though not strictly required by prompt
            // For example: onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/CCCCCC/333333?text=Logo')}
          />
        </div>
        <p className="logo-caption">{captionText}</p>
      </div>
    </div>
  );
};

export default SpinningLogo;
