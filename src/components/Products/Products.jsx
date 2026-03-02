import React from 'react'
import Image1 from '../../assets/Products/ethnic.png'
import Image2 from '../../assets/Products/womencasual.png'
import Image3 from '../../assets/Products/menformal.png'
import Image4 from '../../assets/Products/womenformal.png'
import Image5 from '../../assets/Products/mencasual.png'
import { FaStar } from "react-icons/fa";
import { Link } from 'react-router-dom';
const ProductsData = [
    {
        id:1,
        img:Image1,
        title:"Women Ethnics",
        Price:"800",
        aosDelay:"0",
    },
    {
        id:2,
        img:Image2,
        title:"Women Casual",
        Price:"500",
        aosDelay:"200",
    },
    {
        id:3,
        img:Image3,
        title:"Men Formals",
        Price:"1200",
        aosDelay:"400",
    },
    {
        id:4,
        img:Image4,
        title:"Women Formals",
        Price:"1500",
        aosDelay:"600",
    },
    {
        id:5,
        img:Image5,
        title:"Men Casual",
        Price:"700",
        aosDelay:"800",
    },
];

const products = () => {
  return (
    <div className="mt-14 mb-12">
        <div className="container">
            {/* Header section  */}
            <div className="text-center mb-10 max-w-[600px] mx-auto">
                <p data-aos="fade-up" className="text-sm text-primary">Top selling products for you</p>
                <h1 data-aos="fade-up" className="text-3xl font-bold">Products</h1>
                <p data-aos="fade-up" className="text-xs text-gray-400">Explore our wide range of products tailored to meet your needs and preferences.
                 Enjoy seamless shopping with unbeatable prices and quality assurance.</p>
            </div>
            {/* Body section  */}
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 
                lg:grid-cols-5 place-items-center gap-5">
                    {/* card section  */}
                    {ProductsData.map((data)=>(
                        <div 
                        data-aos="fade-up" 
                        data-aos-delay={data.aosDelay}
                        key={data.id} className="space-y-3">
                            <img src={data.img} alt=" "
                            className="h-[220px] w-[150px] object-cover rounded-md"/>
                            <div>
                                <h3 className="font-semibold">{data.title}</h3>
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400"/>
                                    <span>₹{data.Price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* View all products button */}
<div className="flex justify-center mt-10" data-aos="fade-up" data-aos-delay="100">
  <Link to="/all-products">
    <button
      className="bg-primary text-white px-6 py-2 rounded-full 
      hover:bg-primary/90 duration-200 ease-in-out hover:scale-105"
    >
    View All Products
  </button>
  </Link>
</div>

            </div>
        </div>
    </div>
  )
}

export default products