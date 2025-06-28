import React, { useRef } from 'react'
import { CubeTransparentIcon, PresentationChartBarIcon, BanknotesIcon, UserGroupIcon, CheckBadgeIcon,BuildingLibraryIcon, HomeModernIcon, ScaleIcon, BriefcaseIcon } from '@heroicons/react/24/outline'

const Services = () => {
  const features = [
    {
      name: 'Real Estate & Conveyancing Law',
      description:
        'Seamless transactions, from property acquisition to sale.',
      icon: HomeModernIcon,
    },
    {
      name: 'Commercial & Corporate Law',
      description:
        'Structuring, compliance, and business advisory.',
      icon: ScaleIcon,
    },
    {
      name: 'Family Law – Divorce & Child Custody',
      description:
        'Compassionate, strategic representation for sensitive matters.',
      icon: UserGroupIcon,
    },
    {
      name: 'Legal Audit & Compliance',
      description:
        'Ensuring regulatory alignment and risk mitigation.',
      icon: CheckBadgeIcon,
    },
    {
      name: 'Probate Administration',
      description:
        'Expert guidance through estate administration and succession.',
      icon: BuildingLibraryIcon,
    },
    {
      name: 'Family-Owned Business & Estate Planning Advisory',
      description:
        'Safeguarding legacy and planning for generational transitions.',
      icon: BriefcaseIcon,
    },
    {
      name: 'Start-Ups & SMEs',
      description:
        'Supporting entrepreneurs from formation to scale.',
      icon: PresentationChartBarIcon,
    },
    {
      name: 'Dispute Resolution',
      description:
        'Effective advocacy through negotiation, mediation, and litigation.',
      icon: CubeTransparentIcon,
    },
    {
      name: 'Banking Securities',
      description:
        'Structuring and securing financial transactions.',
      icon: BanknotesIcon,
    },
  ]
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div id="services" className="relative py-24 overflow-hidden bg-white border border-b-1 border-b-light sm:py-32 isolate">
      {/* Mobile */}
      <img
        alt="services"
        src="https://github.com/gacheruevans/enmlegal/blob/main/dist/gavel_background.jpg?raw=true"
        className="absolute inset-0 object-cover blur-90 -z-10 size-full md:object-center brightness-75"
      />
      
      {/* Desktop */}
      <img
        alt="services"
        src="https://github.com/gacheruevans/enmlegal/blob/main/dist/gavel_background.jpg?raw=true"
        className="absolute inset-0 hidden object-cover object-right lg:display-block blur-90 -z-10 size-full md:object-center"
      />
      <div className="px-4 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto lg:text-center">
          {/* Mobile */}
          <p className="mt-2 text-4xl font-semibold tracking-tight text-royal text-pretty sm:text-5xl lg:text-balance">
            Our Practice Areas
          </p>
          <p className="mt-6 text-2xl text-accent">
            We offer legal services across key areas of law tailored to your needs.
          </p>
          {/* Desktop */}
          <p className="hidden mt-2 text-4xl font-semibold tracking-tight text-white lg:display-block text-pretty sm:text-5xl lg:text-balance">
            Our Practice Areas
          </p>
          <p className="hidden mt-6 text-2xl lg:display-block text-secondary">
            We offer legal services across key areas of law tailored to your needs.
          </p>
        </div>
        {/* Mobile: horizontal scroll gallery */}
        <div className="relative block mt-16 lg:hidden sm:mt-20">
         
          <div
            ref={scrollRef}
            className="flex gap-4 px-8 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }}
          >
            {features.map((feature) => (
              <div
                key={feature.name}
                className="min-w-[260px] max-w-xs flex-shrink-0 snap-center relative p-4 pl-16 transition-colors duration-300 rounded-md text-secondary bg-white/20 backdrop-blur-sm hover:bg-gray-700 hover:text-white"
              >
                <dt className="font-semibold text-base/7">
                  <div className="absolute flex items-center justify-center rounded-lg top-4 left-4 bg-royal hover:bg-neutral size-10">
                    <feature.icon aria-hidden="true" className="text-white size-6" />
                  </div>
                  <p className="text-white hover:text-secondary">{feature.name}</p>
                </dt>
                <dd className="mt-2 text-base/7">{feature.description}</dd>
              </div>
            ))}
          </div>
          
        </div>
        {/* Desktop : grid */}
        <div className="hidden max-w-3xl mx-auto mt-16 lg:block sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative p-2 pl-16 transition-colors duration-300 rounded-md text-secondary bg-white/20 backdrop-blur-sm hover:bg-gray-700 hover:text-white">
                <dt className="font-semibold text-base/7">
                  <div className="absolute top-0 left-0 flex items-center justify-center rounded-lg bg-royal hover:bg-neutral size-10">
                    <feature.icon aria-hidden="true" className="text-white size-6" />
                  </div>
                  <p className="text-white hover:text-secondary">{feature.name}</p>
                </dt>
                <dd className="mt-2 text-base/7">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Services;
