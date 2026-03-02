import React from 'react'
import footerBg from '../../assets/Banner/footer.png'
import logo from '../../assets/logo.png'
import { FaInstagram, FaFacebook,FaLinkedin,FaLocationArrow,
  FaMobileAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom';
const BannerImage={
  backgroundImage: `url(${footerBg})`,
  backgroundPosition:"bottom",
  backgroundRepeat:"no-repeat",
  backgroundSize:"cover",
  height:"100%",
  width:"100%",
}

const FooterLinks=[
  {
    title:"Home",
    link:"/"
  },
  {
    title:"About",
    link:"/about"
  },
  {
    title:"Contact",
    link:"/contact"
  },
]
const Footer = () => {
  return (
    // REMOVED mb-20 here to eliminate the extra space
    <div style={BannerImage} className="text-white"> 
      <div className="container">
        <div data-aos="zoom-in" className="grid md:grid-cols-3 pb-20 pt-5"> {/* Reduced pb-44 to pb-20 */}
          {/* company details  */}
          <div className='py-8 px-4'>
            <h1 className='sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3'>
              <img src={logo} alt="" className='max-w-[50px]'/>Shopsy
            </h1>
            <p>Get your favourite collections under exclusive offers and enjoy the shopping with us.</p>
          </div>
          
          {/* footer links logic remains the same... */}
          <div className='grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10'>
             <div>
              <div className='py-8 px-4'>
                <h1 className='sm:text-xl text-xl font-bold sm:text-left
                text-justify mb-3'>Important Links</h1>
                <ul className='flex flex-col gap-3'>
                  {FooterLinks.map((link)=>(
                    <li className='cursor-pointer hover:text-primary
                    hover:translate-x-1 duration-300 text-gray-200' key={link.title}>
                      <Link to={link.link}>{link.title}</Link>
                    </li>
                  ))
                  }
                </ul>
              </div>
            </div>
            
            {/* social links */}
            <div className='py-8 px-4'>
              <div className='flex items-center gap-3 mt-6'>
                <a href="https://www.instagram.com/amazon" target="_blank" 
                rel="noopener noreferrer">
                <FaInstagram className='text-3xl hover:text-primary duration-300'/></a>
                <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebook className='text-3xl hover:text-primary duration-300'/></a>
                <a href="https://github.com/Alminta-5" 
                 target="_blank" 
                 rel="noopener noreferrer"><FaLinkedin className='text-3xl hover:text-primary duration-300'/></a>
              </div>
              <div className='mt-6'>
                <div className='flex items-center gap-3'>
                  <FaLocationArrow />
                  <p>Ernakulam, Kerala</p>
                </div>
                <div className='flex items-center gap-3 mt-3'>
                  <FaMobileAlt />
                  <p>+91 9862746581</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Footer