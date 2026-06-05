'use client';

// Footer Mobile — layout vertikal untuk layar kecil
// Hanya muncul di breakpoint < lg (max-width: 1024px)

import Link from 'next/link';
import DiamondLogo from './DiamondLogo';
import { footerNavigation, socialLinks, copyrightText } from './footer.config';

// Icon SVG inline — menghindari masalah import SVG di Next.js
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g clipPath="url(#clipInsta)">
        <path d="M9.37344 0.112022C7.67104 0.192289 6.50851 0.464022 5.49211 0.863222C4.44038 1.27322 3.54878 1.82322 2.66171 2.71349C1.77478 3.60376 1.22838 4.49589 0.821442 5.54949C0.427575 6.56789 0.160642 7.73149 0.0854421 9.43482C0.0102421 11.1382 -0.00642455 11.6858 0.00197545 16.0308C0.0102421 20.3756 0.0294421 20.9203 0.111975 22.6272C0.193309 24.3292 0.463975 25.4915 0.863309 26.5082C1.27398 27.56 1.82331 28.4512 2.71398 29.3386C3.60451 30.2259 4.49598 30.771 5.55198 31.1786C6.56958 31.5719 7.73344 31.84 9.43651 31.9146C11.1396 31.9892 11.6877 32.0066 16.0314 31.9982C20.3752 31.9899 20.9221 31.9706 22.6285 31.8896C24.3352 31.8087 25.4912 31.536 26.5082 31.1386C27.5601 30.7271 28.452 30.1786 29.3386 29.2878C30.2253 28.3968 30.7713 27.504 31.178 26.4499C31.5722 25.4323 31.8401 24.2686 31.914 22.5667C31.9886 20.8588 32.0062 20.3136 31.998 15.9694C31.9896 11.625 31.97 11.0803 31.889 9.37402C31.8081 7.66776 31.537 6.50909 31.138 5.49176C30.7268 4.43989 30.178 3.54936 29.2878 2.66136C28.3976 1.77336 27.504 1.22776 26.4504 0.822022C25.432 0.428022 24.2689 0.159622 22.5658 0.0860224C20.8628 0.0124224 20.3146 -0.00664428 15.9693 0.00188905C11.624 0.0101557 11.08 0.0288224 9.37344 0.112022ZM9.56038 29.0362C8.00038 28.9683 7.15331 28.7091 6.58878 28.4922C5.84131 28.2042 5.30878 27.856 4.74624 27.2988C4.18358 26.7418 3.83811 26.2074 3.54624 25.4615C3.32704 24.897 3.06304 24.0508 2.99011 22.4908C2.91078 20.8048 2.89411 20.2986 2.88478 16.0268C2.87544 11.7552 2.89184 11.2495 2.96571 9.56282C3.03238 8.00416 3.29318 7.15616 3.50971 6.59189C3.79771 5.84349 4.14464 5.31189 4.70304 4.74976C5.26144 4.18749 5.79424 3.84122 6.54078 3.54936C7.10478 3.32922 7.95078 3.06749 9.51011 2.99322C11.1974 2.91322 11.703 2.89722 15.9741 2.88789C20.2452 2.87856 20.7521 2.89456 22.4401 2.96896C23.9988 3.03669 24.8472 3.29496 25.4108 3.51296C26.1585 3.80096 26.6908 4.14682 27.2529 4.70629C27.8152 5.26549 28.1617 5.79642 28.4536 6.54456C28.674 7.10682 28.9358 7.95256 29.0094 9.51296C29.0897 11.2003 29.1062 11.7063 29.1155 15.9772C29.1249 20.2483 29.1082 20.754 29.0346 22.4414C28.9673 23.9996 28.7085 24.8477 28.4918 25.4115C28.2038 26.1598 27.8569 26.6918 27.2984 27.2539C26.7402 27.816 26.2069 28.162 25.4605 28.4539C24.8971 28.674 24.0513 28.9359 22.4918 29.0096C20.8042 29.0895 20.2982 29.1061 16.0262 29.1155C11.7542 29.1248 11.2491 29.1081 9.56038 29.0362ZM24.5261 7.46936C24.5261 8.14776 23.9781 8.69576 23.2997 8.69576C22.6213 8.69576 22.0733 8.14776 22.0733 7.46936C22.0733 6.79096 22.6213 6.24296 23.2997 6.24296C23.9781 6.24296 24.5261 6.79096 24.5261 7.46936ZM16.0037 8.06802C11.6048 8.06802 8.04138 11.6314 8.04138 16.0302C8.04138 20.4293 11.6048 23.9919 16.0037 23.9919C20.4029 23.9919 23.9653 20.4293 23.9653 16.0302C23.9653 11.6314 20.4029 8.06802 16.0037 8.06802ZM16.0037 21.5356C12.9615 21.5356 10.4983 19.0728 10.4983 16.0302C10.4983 12.9878 12.9615 10.5246 16.0037 10.5246C19.0461 10.5246 21.5083 12.9878 21.5083 16.0302C21.5083 19.0728 19.0461 21.5356 16.0037 21.5356Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clipInsta">
          <rect width="32" height="32" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconTiktok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M25.6 8.9c-0.3-0.1-0.6-0.2-0.9-0.3-0.3-0.1-0.6-0.2-0.8-0.4-0.3-0.1-0.5-0.3-0.7-0.5-0.2-0.2-0.4-0.4-0.5-0.7-0.1-0.3-0.2-0.5-0.2-0.8 0-0.3 0-0.6 0.1-0.9V2.2h-3.8v19.4c0 1.3-0.4 2.4-1.3 3.3-0.9 0.9-2 1.3-3.3 1.3-1.3 0-2.4-0.4-3.3-1.3-0.9-0.9-1.3-2-1.3-3.3 0-1.3 0.4-2.4 1.3-3.3 0.9-0.9 2-1.3 3.3-1.3 0.4 0 0.8 0.1 1.2 0.2 0.4 0.1 0.7 0.3 1.1 0.5v-3.9c-0.7-0.2-1.4-0.3-2.1-0.3-1.4 0-2.7 0.3-3.9 1-1.2 0.7-2.1 1.6-2.8 2.8-0.7 1.2-1 2.5-1 3.9 0 1.4 0.3 2.7 1 3.9 0.7 1.2 1.6 2.1 2.8 2.8 1.2 0.7 2.5 1 3.9 1 1.4 0 2.7-0.3 3.9-1 1.2-0.7 2.1-1.6 2.8-2.8 0.7-1.2 1-2.5 1-3.9V11.4c1.3 0.9 2.7 1.5 4.3 1.7V9.4c-0.3 0-0.6-0.1-0.9-0.1-0.9-0.2-1.7-0.5-2.5-0.9-0.7-0.4-1.4-0.9-1.9-1.5z"/>
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M27.3 2.7H4.7C3.6 2.7 2.7 3.6 2.7 4.7v22.6c0 1.1 0.9 2 2 2h22.6c1.1 0 2-0.9 2-2V4.7c0-1.1-0.9-2-2-2zM10.2 24.5H6.2V12.4h4v12.1zM8.2 10.7c-1.3 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3 0 1.3-1 2.3-2.3 2.3zM25.8 24.5h-4v-6c0-1.4-0.6-2.4-1.8-2.4-1.2 0-1.9 0.9-1.9 2.4v6h-4V12.4h4v1.5c0.8-1.1 1.9-1.7 3.4-1.7 2.5 0 4.3 1.6 4.3 5v7.3z"/>
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686 0.235 2.686 0.235v2.953H15.83c-1.491 0-1.956 0.925-1.956 1.874v2.25h3.328l-0.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Instagram: IconInstagram,
  X: IconX,
  TikTok: IconTiktok,
  LinkedIn: IconLinkedin,
  Facebook: IconFacebook,
};

export default function FooterMobile() {
  return (
    <footer
      aria-label="Navigasi footer"
      className="bg-[#1A1917] w-full"
    >
      {/* Container dengan padding */}
      <div className="w-full px-8 pt-8 pb-6 flex flex-col items-center">
        {/* Navigation Sections — vertikal */}
        <div className="flex flex-col items-center gap-8 w-full">
          {footerNavigation.map((section) => (
            <nav
              key={section.title}
              aria-label={section.title}
              className="flex flex-col items-center"
            >
              {/* Section Title */}
              <h3 className="font-display text-[#E8E4DC] text-2xl font-bold mb-6 text-center">
                {section.title}
              </h3>
              {/* Links */}
              <div className="flex flex-col items-center gap-4">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-display text-[#8A8880] text-xl hover:text-[#E8E4DC] transition-colors duration-150 text-center"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>

        {/* Diamond Logo */}
        <div className="mt-12 mb-16">
          <DiamondLogo size={72} variant="dark" />
        </div>

        {/* Social Icons Row */}
        <div className="flex items-center justify-between w-full px-8 mb-10">
          {socialLinks.map((social) => {
            const IconComponent = iconMap[social.platform];
            return (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className="text-[#8A8880] hover:text-[#E8E4DC] transition-colors duration-150"
              >
                {IconComponent && (
                  <IconComponent className="w-8 h-8" />
                )}
              </a>
            );
          })}
        </div>

        {/* Copyright */}
        <p className="font-interface text-[#8A8880] text-sm w-full">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
