import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { amount, currency } = await req.json();

  // Call Razorpay API to create an Order
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(Deno.env.get("RAZORPAY_KEY_ID") + ":" + Deno.env.get("RAZORPAY_KEY_SECRET"))}`
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay expects paise (100 paise = 1 INR)
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`
    })
  });

  const order = await response.json();
  return new Response(JSON.stringify(order), { headers: { "Content-Type": "application/json" } });
})