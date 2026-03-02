import React from 'react';
import CountUp from 'react-countup'; //
import image from "../assets/Hero/woman.png"; 

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 duration-200 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            About Shopsy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your ultimate destination for fashion and lifestyle. We bring you the latest 
            trends with the best quality and prices.
          </p>
        </div>

        {/* Content Section with Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div data-aos="zoom-in">
            <img 
              src={image} 
              alt="Our Story" 
              className="max-w-[400px] h-[350px] w-full mx-auto drop-shadow-[-10px_10px_12px_rgba(0,0,0,1)] object-cover rounded-2xl" 
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Started in 2025, Shopsy began with a simple mission: to make premium 
              fashion accessible to everyone. We believe that style shouldn't come 
              at a high price, and quality should never be compromised.
            </p>
            
            {/* STATS SECTION WITH COUNTER EFFECT */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center flex-1">
                <h3 className="font-bold text-primary text-3xl">
                  {/* start: from where to begin, end: the target number */}
                  <CountUp start={0} end={10} duration={3} />k+
                </h3>
                <p className="text-sm dark:text-gray-300">Happy Customers</p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center flex-1">
                <h3 className="font-bold text-primary text-3xl">
                  <CountUp start={0} end={500} duration={3} />+
                </h3>
                <p className="text-sm dark:text-gray-300">Quality Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <h3 className="font-bold text-xl mb-2 dark:text-white">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-400">Get your favorite outfits delivered to your doorstep in no time.</p>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-xl mb-2 dark:text-white">Best Quality</h3>
            <p className="text-gray-600 dark:text-gray-400">Every product is handpicked and checked for the highest standards.</p>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-xl mb-2 dark:text-white">Easy Returns</h3>
            <p className="text-gray-600 dark:text-gray-400">Not the right fit? Our 30-day return policy has you covered.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;