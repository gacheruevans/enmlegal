import { motion } from 'framer-motion'

// eslint-disable-next-line react-refresh/only-export-components
const About = () => {
  const aspirations = [
    {
      name: 'Real Estate & Conveyancing Law',
      description:
        'Seamless transactions, from property acquisition to sale.',
    },
    {
      name: 'Commercial & Corporate Law',
      description:
        'Structuring, compliance, and business advisory.',
    },
    {
      name: 'Family Law – Divorce & Child Custody',
      description:
        'Compassionate, strategic representation for sensitive matters.',
    },
    {
      name: 'Legal Audit & Compliance',
      description:
        'Ensuring regulatory alignment and risk mitigation.',
    },
    {
      name: 'Probate Administration',
      description:
        'Expert guidance through estate administration and succession.',
    },
    {
      name: 'Family-Owned Business & Estate Planning Advisory',
      description:
        'Safeguarding legacy and planning for generational transitions.',
    },
    {
      name: 'Start-Ups & SMEs',
      description:
        'Supporting entrepreneurs from formation to scale.',
    },
    {
      name: 'Dispute Resolution',
      description:
        'Effective advocacy through negotiation, mediation, and litigation.',
    },
    {
      name: 'Banking Securities',
      description:
        'Structuring and securing financial transactions.',
    },
  ]
  return (
   
    <div id="about" className="overflow-hidden bg-white border-b-4 border-secondary elative isolate sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="relative w-full max-w-6xl px-4 py-8 mx-auto">
          {/* Mobile: text over background image */}
          <div className="block lg:hidden relative h-[500px] rounded-md overflow-hidden">
            <img
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/about-bg.jpg?raw=true"
              alt="Founder Eva Nduta Munene"
              className="absolute inset-0 object-cover object-center w-full h-full brightness-75"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="relative z-10 flex flex-col justify-center h-full px-4 py-8 text-white bg-black/40"
            >
              <div className="max-w-lg mx-auto text-center text-wrap">
                <p className="mb-4 text-3xl font-semibold tracking-tight drop-shadow-lg text-royal">
                  Who we are
                </p>
                <p className="mb-3 text-base drop-shadow-lg">
                  <span className="font-bold text-royal">E. Nduta Munene &amp; Company Advocates</span> is a boutique law firm specializing in delivering tailored
                  legal solutions with a personal touch.
                </p>
                <p className="mb-3 text-base drop-shadow-lg">
                  Led by <span className="font-bold text-royal">Eva Nduta Munene</span>, an accomplished Advocate of the High Court of Kenya with over 14
                  years of dedicated legal practice, the firm is committed to providing personalized, reliable, and
                  strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Desktop: text left, mosaic images right */}
          <div className="items-center hidden grid-cols-2 gap-12 lg:grid">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="max-w-lg"
            >
              <p className="mb-6 text-5xl font-semibold tracking-tight text-secondary">
                Who we are
              </p>
              <p className="mb-4 text-lg text-primary">
                <span className="font-bold text-slate-800">E. Nduta Munene &amp; Company Advocates</span> is a boutique law firm specializing in delivering tailored
                legal solutions with a personal touch. Our team of dedicated legal consultants brings extensive
                experience and a deep understanding of various practice areas, ensuring our clients receive expert
                guidance and representation.
              </p>
              <p className="mb-4 text-lg text-primary">
                Led by <span className="font-bold text-slate-800">Eva Nduta Munene</span>, an accomplished Advocate of the High Court of Kenya with over 14
                years of dedicated legal practice, the firm is committed to providing personalized, reliable, and
                strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.
              </p>
              <p className="text-lg text-primary">
                With a strong foundation in real estate and conveyancing, corporate and commercial law, and
                banking securities and finance, the firm brings a practical, results-oriented approach to every
                matter we handle. Our legal acumen is grounded in years of experience working with diverse
                clients, from individual property buyers to multinational corporations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
              className="grid grid-cols-2 grid-rows-2 gap-4 h-[420px] w-full"
            >
              <img
                src="https://github.com/gacheruevans/enmlegal/blob/main/dist/about-bg.jpg?raw=true"
                alt="Founder Eva Nduta Munene"
                className="object-cover w-full h-full col-span-2 row-span-2 rounded-md bg-secondary"
              />
              <img
                src="https://github.com/gacheruevans/enmlegal/blob/main/dist/profile2.png?raw=true"
                alt="Founder Eva Nduta Munene"
                className="absolute object-cover w-48 h-48 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-md shadow-lg top-1/2 left-2/3 bg-slate-900"
                style={{ zIndex: 2 }}
              />
            </motion.div>
          </div>
        </div>
      </div>
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <hr className="mb-8"/>
        {/* Mission Section */}
        <div className="grid items-center grid-cols-1 mb-16 lg:grid-cols-2 gap-y-8 lg:gap-x-8">
          {/* Mobile: image with overlayed text */}
          <div className="relative block w-full overflow-hidden rounded-md h-80 lg:hidden">
            <img
              alt="mission"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/services.jpg?raw=true"
              className="absolute inset-0 object-cover object-center w-full h-full brightness-75"
            />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 py-8 bg-black/40">
              <h2 className="mb-4 text-3xl font-bold text-royal drop-shadow-lg">Our mission</h2>
              <p className="mb-2 text-base font-medium text-center text-white drop-shadow-lg">
                To provide high-quality legal services with a focus on exceptional client care.
              </p>
              <p className="text-base font-medium text-center text-white drop-shadow-lg">
                We are committed to building long-term relationships with our clients, understanding their unique needs, and delivering effective legal solutions that drive success.
              </p>
            </div>
          </div>
          
          {/* Desktop: image left, text right */}
          <img
            alt="mission"
            src="https://github.com/gacheruevans/enmlegal/blob/main/dist/services.jpg?raw=true"
            className="hidden object-cover w-full rounded-md lg:block h-96"
          />
          <div className="hidden pl-8 lg:block">
            <h2 className="mb-6 text-5xl font-bold text-secondary">Our mission</h2>
            <p className="mb-4 text-lg font-medium text-primary">
              To provide high-quality legal services with a focus on exceptional client care.
            </p>
            <p className="text-lg font-medium text-primary">
              We are committed to building long-term relationships with our clients, understanding their unique needs, and delivering effective legal solutions that drive success.
            </p>
          </div>
        </div>
        <hr className="mb-8"/>
        {/* Aspirations Section */}
        {/* Vision Section */}
        <div className="grid items-center grid-cols-1 lg:grid-cols-2 gap-y-8 lg:gap-x-8">
          {/* Mobile: image with overlayed text */}
          <div className="relative block w-full mb-12 overflow-hidden rounded-md h-80 lg:hidden">
            <img
              alt="vision"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/innovation.jpg?raw=true"
              className="absolute inset-0 object-cover object-center w-full h-full brightness-75"
            />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 py-8 bg-black/40">
              <h2 className="mb-4 text-3xl font-bold text-royal drop-shadow-lg">Our Vision</h2>
              <p className="text-base font-medium text-center text-white drop-shadow-lg">
                We seek to be the premier boutique law firm recognized for our unwavering commitment to excellence, innovation, and client success.<br />
                We envision a future where our firm is synonymous with legal excellence, client satisfaction, and a positive impact on the legal profession and the broader community.
              </p>
            </div>
          </div>
          
          {/* Desktop: text left, image right */}
          <div className="hidden pr-8 lg:block">
            <h2 className="mb-6 text-5xl font-bold text-secondary">Our Vision</h2>
            <p className="text-lg font-medium text-primary">
              We seek to be the premier boutique law firm recognized for our unwavering commitment to excellence, innovation, and client success.<br />
              We envision a future where our firm is synonymous with legal excellence, client satisfaction, and a positive impact on the legal profession and the broader community.
            </p>
          </div>
          <img
            alt="vision"
            src="https://github.com/gacheruevans/enmlegal/blob/main/dist/innovation.jpg?raw=true"
            className="hidden object-cover w-full rounded-md lg:block h-96"
          />
        </div>
      </div>
    </div>
    
  )
}

export default About;

