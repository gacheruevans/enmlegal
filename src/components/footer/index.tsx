import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear();
  return (
    <footer className="px-8 py-8 text-white bg-slate-950 md:px-16 lg:px-28 isolate">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
                <h2 className="mb-4 text-lg font-weight-300">Office</h2>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Address: Block B, 3rd Floor, Suite 3.2</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; KMA Center, Chyulu Road, Upper Hill</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; P.O Box 40964-00100, Nairobi</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Contacts: +254 733-700-004 & +254 701-857-030</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Email: &nbsp; &nbsp; &nbsp; info@enmlegal.com</p>
            </div>
            <div>
                <h2 className="mb-4 text-lg font-weight-300">Quick Links</h2>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Home</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">About</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Practice Areas</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Blog</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Contacts</p>
            </div>
            <div>
                <h2 className="mb-4 text-lg font-weight-300">Legal</h2>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Terms of service</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">Privacy policy</p>
                <p className="py-1 text-sm text-gray-300 font-weight-100">License </p>
            </div>
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
           
        </div>
        <div className="div"></div>
        <div className="pt-6 mt-6 text-center text-gray-300 border-t border-gray-800">
            <p> © {currentYear} CREATIVEZINK. All rights reserved. </p>
        </div>
        <div>
            <h2 className="mb-4 text-lg font-weight-300"> Follow Us</h2>
            <ul className="flex space-x-4 text-gray-300">
                <li>Facebook</li>
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Instagram</li>
            </ul>
        </div>
    </footer>
  )
}

export default Footer