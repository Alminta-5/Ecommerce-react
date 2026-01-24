import React from 'react'
import Slider from "react-slick"
const TestimonialData=[
    {
        id:1,
        name :"Victor",
        text :"I usually take a lot of time deciding what to buy online, but this website made the whole process simple and enjoyable. The product quality, clear details, and quick delivery really stood out. It feels good to shop from a place you can actually trust."
    },
    {
        id:2,
        name:"Virat Kohli",
        text:"Shopping here was easy and enjoyable. The quality was great, the checkout was smooth, and my order arrived faster than expected. It’s a place I trust and would happily shop from again."
    },
    {
        id:3,
        name:"Samantha Ruth Prabhu",
        text:"Everything about shopping here felt simple and reliable. The products matched the quality promised, and the overall experience was smooth from start to finish."
    },
    {
        id:4,
        name:"Sachin Tendulkar",
        text:"What I love most about shopping here is the attention to quality and customer experience. Every product feels thoughtfully curated, the prices are fair, and the service is dependable. It’s the kind of shopping experience that makes you feel valued as a customer."
    }

]
const Testimonials = () => {
    var settings={
        dots:true,
        arrows:false,
        infinite:true,
        speed:500,
        slidesToScroll:1,
        autoplay:true,
        autoplaySpeed:2000,
        cssEase:"linear",
        pauseOnHover:true,
        pauseOnFocus:true,
        slidesToShow:3,
        responsive: [
            // {
            //   breakpoint: 10000,
            //   settings: {
            //   slidesToShow: 1,
            //   },
            // },

            {
                breakpoint:1024,
                settings:{
                    slidesToShow:2,
                    slidesToScroll:1,
                    initialSlide:2,
                },
            },
            {
                breakpoint:640,
                settings:{
                    slidesToShow:1,
                    slidesToScroll:1,
                },
            },
        ]
    }
  return (
    <div className="py-10 mb-10">
       <div className="container">
        {/* header section  */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
                <p data-aos="fade-up" className="text-sm text-primary">
                    What our customers are saying</p>
                <h1 data-aos="fade-up" className="text-3xl font-bold">
                    Testimonials</h1>
                <p data-aos="fade-up" className="text-xs text-gray-400">Explore our wide range of products tailored to meet your needs and preferences.
                 Enjoy seamless shopping with unbeatable prices and quality assurance.</p>
            </div>
            {/* Testimonial cards */}
            <div data-aos="zoom-in" className="flex justify-center">
                <Slider{...settings} className="w-full max-w-5xl">
                    {
                        TestimonialData.map((data)=>(
                            <div className="my-6 px-3">
                            <div key={data.id}
                            className="flex flex-col justify-between shadow-lg
                            py-8 px-6 rounded-xl dark:bg-gray-800
                            bg-primary/10 relative min-h-[260px] mx-auto">
                                {/* <div>
                                    Image section
                               </div> */}
                               <div className="flex flex-col items-center gap-4">
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500">
                                    {data.text}</p>
                                <h1 className="text-xl font-bold text-black/80
                                dark:text-light">{data.name}</h1>
                                </div>
                               </div>
                               {/* <p className="text-black/20 text-9xl font-serif
                               absolute top-0 right-0">,,</p> */}
                               <p className="text-black/20 text-8xl font-serif
                               absolute bottom-2 right-4 select-none leading-none">
                                ,,
                               </p>
                            </div>
                            </div>
                            
                        ))
                    }
                </Slider>
            </div>
        </div> 
    </div>
  )
}

export default Testimonials