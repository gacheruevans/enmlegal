import React, { useRef } from 'react'
import {
  CubeTransparentIcon,
  PresentationChartBarIcon,
  BanknotesIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BuildingLibraryIcon,
  HomeModernIcon,
  ScaleIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useSiteContent } from '../../context/SiteContentContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  HomeModernIcon,
  ScaleIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  PresentationChartBarIcon,
  CubeTransparentIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
};

const Services = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { content } = useSiteContent();
  const services = content.services;

  const rawCards = services?.cards || [];
  const cards = rawCards.map((c: any) => ({
    name: c.title || c.name || '',
    subtitle: c.subtitle || '',
    description: c.subtext || c.description || '',
    icon: c.icon || 'ScaleIcon',
    imageUrl: c.imageUrl,
  }));

  const title = services?.title;
  const subtitle = services?.subtitle;
  const subtext = services?.subtext;

  return (
    <div id="services" className="relative py-24 overflow-hidden bg-white border border-b-1 border-b-light sm:py-32 isolate">
      {/* Mobile */}
      <img
        alt="./gavel_background.jpg"
        src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/gavel_background.jpg?raw=true`}
        className="absolute inset-0 object-cover blur-90 -z-10 size-full md:object-center brightness-75"
      />
      
      {/* Desktop */}
      <img
        alt="./gavel_background.jpg"
        src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/gavel_background.jpg?raw=true`}
        className="absolute inset-0 hidden object-cover object-right lg:display-block blur-90 -z-10 size-full md:object-center"
      />
      <div className="px-4 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          {/* Mobile */}
          {title && (
            <p className="mt-2 text-4xl font-semibold tracking-tight text-royal text-pretty sm:text-5xl lg:text-balance">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="mt-6 text-2xl text-accent">
              {subtitle}
            </p>
          )}
          {subtext && (
            <p className="mt-3 text-base text-gray-200">
              {subtext}
            </p>
          )}

          {/* Desktop */}
          {title && (
            <p className="hidden mt-2 text-4xl font-semibold tracking-tight text-white lg:display-block text-pretty sm:text-5xl lg:text-balance">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="hidden mt-6 text-2xl lg:display-block text-secondary">
              {subtitle}
            </p>
          )}
          {subtext && (
            <p className="hidden mt-3 text-base lg:display-block text-gray-300">
              {subtext}
            </p>
          )}
        </div>
        {/* Mobile: horizontal scroll gallery */}
        <div className="relative block mt-16 lg:hidden sm:mt-20">
          <div
            ref={scrollRef}
            className="flex gap-4 px-8 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }}
          >
            {cards.map((feature: any, idx: number) => {
              const IconComp = ICON_MAP[feature.icon] || ScaleIcon;
              return (
                <div
                  key={`${feature.name}-${idx}`}
                  className="min-w-[260px] max-w-xs flex-shrink-0 snap-center relative p-4 pl-16 transition-colors duration-300 rounded-md text-secondary bg-white/20 backdrop-blur-sm hover:bg-gray-700 hover:text-white"
                >
                  <dt className="font-semibold text-base/7">
                    <div className="absolute flex items-center justify-center rounded-lg top-4 left-4 bg-royal hover:bg-neutral size-10 overflow-hidden">
                      {feature.imageUrl ? (
                        <img src={feature.imageUrl} alt={feature.name} className="size-full object-cover" />
                      ) : (
                        <IconComp aria-hidden="true" className="text-white size-6" />
                      )}
                    </div>
                    <p className="text-white hover:text-secondary">{feature.name}</p>
                    {feature.subtitle && (
                      <p className="text-xs text-amber-300/80 font-normal">{feature.subtitle}</p>
                    )}
                  </dt>
                  <dd className="mt-2 text-base/7">{feature.description}</dd>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop : grid */}
        <div className="hidden max-w-3xl mx-auto mt-16 lg:block sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {cards.map((feature: any, idx: number) => {
              const IconComp = ICON_MAP[feature.icon] || ScaleIcon;
              return (
                <div
                  key={`${feature.name}-${idx}`}
                  className="relative p-2 pl-16 transition-colors duration-300 rounded-md text-secondary bg-white/20 backdrop-blur-sm hover:bg-gray-700 hover:text-white"
                >
                  <dt className="font-semibold text-base/7">
                    <div className="absolute top-0 left-0 flex items-center justify-center rounded-lg bg-royal hover:bg-neutral size-10 overflow-hidden">
                      {feature.imageUrl ? (
                        <img src={feature.imageUrl} alt={feature.name} className="size-full object-cover" />
                      ) : (
                        <IconComp aria-hidden="true" className="text-white size-6" />
                      )}
                    </div>
                    <p className="text-white hover:text-secondary">{feature.name}</p>
                    {feature.subtitle && (
                      <p className="text-xs text-amber-300/80 font-normal">{feature.subtitle}</p>
                    )}
                  </dt>
                  <dd className="mt-2 text-base/7">{feature.description}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Services;
