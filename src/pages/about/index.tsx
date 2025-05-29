import React from 'react'

export const About = () => {
  return (
    <div className="py-24 overflow-hidden bg-light elative isolate sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="grid max-w-2xl grid-cols-1 mx-auto gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white text-pretty sm:text-5xl">
                Who we are
              </p>
              <p className="mt-6 text-gray-200 text-lg/8">
              Led by Eva Nduta Munene, our Founding Partner, we bring years of experience, deep legal insight, and unwavering dedication to every client we represent. 
              Our boutique law firm combines the personal attention of a small practice with the depth of knowledge and professionalism expected of top-tier legal counsel.
              </p>
            </div>
          </div>
          <img
            alt="Founder Eva Nduta Munene"
            src="https://picsum.photos/seed/picsum/600/400"
            className="shadow-xl w-3xl max-w-none rounded-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  )
}
