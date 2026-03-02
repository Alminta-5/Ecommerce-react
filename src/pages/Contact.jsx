import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure this file exports your Supabase client

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Step 1: Insert into DB
  const { data, error } = await supabase
    .from('Contact')
    .insert([{ 
      name: formData.name, 
      email: formData.email, 
      number: formData.phone, 
      message: formData.message 
    }])
    .select()  // <-- get the inserted row back
    .single();

  if (error) {
    alert("Error saving: " + error.message);
    setLoading(false);
    return;
  }

  // Step 2: Directly call the edge function with the record
  try {
    const response = await fetch(
      'https://jhdcopamctltiwuxwdiv.supabase.co/functions/v1/contact-mailer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZGNvcGFtY3RsdGl3dXh3ZGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDE4NzEsImV4cCI6MjA4NjExNzg3MX0.OCUotLQcK0TqGeqycUTLaHu_w7lYa3_5W7XJ-xIXH7A`
        },
        body: JSON.stringify({ record: data })  // send the actual inserted row
      }
    );

    const result = await response.json();
    console.log('Edge function result:', result);

    if (!response.ok) {
      alert("Saved but email failed: " + result.error);
    } else {
      alert("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', message: '' });
    }
  } catch (fnError) {
    console.error('Edge function error:', fnError);
    alert("Saved but email notification failed.");
  }

  setLoading(false);
};

  // Reusable class strings
  const inputClass = `
    mt-1 block w-full p-2 rounded-md border
    bg-white dark:bg-gray-700
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-400
    border-gray-300 dark:border-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    transition duration-200
  `;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-start justify-center p-6 pt-12 transition duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mt-4 transition duration-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Contact Us</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input 
              type="text" 
              className={inputClass}
              placeholder="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input 
              type="email" 
              className={inputClass}
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <input 
              type="text" 
              className={inputClass}
              placeholder="xxxxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className={labelClass}>Message</label>
            <textarea 
              className={`${inputClass} h-32 resize-none`}
              placeholder="How can we help you?"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 
            dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition 
            duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;