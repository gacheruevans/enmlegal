import React from 'react'

export const Contact = () => {
  return (
    <div className="div">
        <h2 className="mb-4 text-lg font-weight-300">Contact Us</h2>
        <p className="py-1 text-sm text-gray-300 font-weight-100">We are here to help you with your legal needs. Reach out to us anytime.</p>
        <form className="mt-4">
            <input type="text" placeholder="Your Name" className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded" />
            <input type="email" placeholder="Your Email" className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded" />
            <textarea placeholder="Your Message" className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded"></textarea>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Send Message</button>
        </form> 
    </div>
  )
}