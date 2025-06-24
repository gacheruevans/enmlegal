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
        <div className="grid max-w-2xl grid-cols-3 mx-auto gap-x-6 gap-y-16 sm:gap-y-10 lg:mx-0 lg:max-w-none lg:grid-cols-3 ">
          <div className="lg:pt-4 lg:pr-8">
            {/* <motion.div
              initial={{opacity: 0}}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeIn' }}
            > */}
              <div className="lg:max-w-lg">
                <p className="mt-2 text-4xl font-semibold tracking-tight text-secondary text-pretty sm:text-5xl">
                  Who we are
                </p>
                <p className="mt-6 text-primary text-lg/8">
                <span className="text-slate-800">E. Nduta Munene &amp; Company Advocates</span> is a boutique law firm specializing in delivering tailored
                legal solutions with a personal touch. Our team of dedicated legal consultants brings extensive
                experience and a deep understanding of various practice areas, ensuring our clients receive exert
                guidance and representation.
                </p>
                <p className="mt-4 text-primary text-lg/8">
                Led by <span className="text-slate-800"> Eva Nduta Munene</span>, an accomplished Advocate of the High Court of Kenya with over 14
                years of dedicated legal practice, the firm is committed to providing personalized, reliable, and
                strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.
                </p>
                <p className="mt-4 text-primary text-lg/8">
                With a strong foundation in real estate and conveyancing, corporate and commercial law, and
                banking securities and finance, the firm brings a practical, results-oriented approach to every
                matter we handle. Our legal acumen is grounded in years of experience working with diverse
                clients, from individual property buyers to multinational corporations.
                </p>
              </div>
            {/* </motion.div> */}
          </div>
          {/* <motion.div
            initial={{ opacity: 0}}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeIn' }}
          > */}
            <img
              alt="Founder Eva Nduta Munene"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/profile.png?raw=true"
              className="object-contain mt-20 rounded-md bg-secondary w-3xl max-w-none sm:w-228 md:-mr-6 lg:-ml-0 saturate-200"
            />
             <img
              alt="Founder Eva Nduta Munene"
              src="https://github.com/gacheruevans/enmlegal/blob/main/dist/profile2.png?raw=true"
              className="object-contain mt-56 rounded-md bg-slate-900 w-80 max-w-none sm:w-228 lg:-ml-6 saturate-195"
            />
          {/* </motion.div> */}
        </div>
      </div>
      <hr className="mt-16 border-neutral"/>
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 mx-auto gap-x-8 lg:gap-y-16 sm:gap-y-0 lg:mx-0 lg:max-w-none lg:grid-cols-2 ">
          <div className="py-20 lg:py-24 lg:mt-16 sm:py-18">
            <img
                alt="mission"
                src="https://github.com/gacheruevans/enmlegal/blob/main/dist/services.jpg?raw=true"
                className="object-cover w-auto rounded-md h-96 sm:h-86 sm:w-86 w-3xl max-w-none sm:w-228 md:-ml-4 lg:-ml-0 saturate-200"
              />
          </div>
          <div className="max-w-2xl px-6 mx-auto lg:max-w-7xl lg:px-8 lg:pt-4 lg:mt-44">
            <p className="text-5xl font-semibold lg:text-center text-secondary">
              Our mission 
            </p>
            <p className="mt-4 text-lg text-primary">To provide high-quality legal services with a focus on exceptional client care.</p>
            <p className="mt-4 text-lg text-primary">
              We are committed to building long-term relationships with our clients, understanding their unique needs, and delivering
              effective legal solutions that drive success.
            </p>
          </div>
          <div className="max-w-2xl px-6 mx-auto lg:max-w-7xl lg:px-8 sm:px-8">
            <h2 className="text-5xl font-semibold text-center text-secondary">Our Vision</h2>
            <p className="mt-4 text-lg text-primary">
              We seek to be the premier boutique law firm recognized for our unwavering commitment to excellence, innovation, and client success. 
              <br/>
              We envision a future where our firm is synonymous with legal excellence, client satisfaction, and a positive impact on the legal profession and the broader community.
            </p>
          </div>
          <div className="py-20 lg:py-0 sm:py-18">
            <img
                alt="mission"
                src="https://github.com/gacheruevans/enmlegal/blob/main/dist/innovation.jpg?raw=true"
                className="object-cover w-auto rounded-md h-96 sm:h-86 sm:w-86 w-3xl max-w-none sm:w-228 md:-ml-4 lg:-ml-0 saturate-200"
              />
          </div>
        </div>
      </div>
    </div>
    
  )
}

export default About;

