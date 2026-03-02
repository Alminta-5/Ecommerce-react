import { supabase } from '../lib/supabaseClient';

export const addToCart = async (product, user, handleAuthPopup) => {
  // 1. Better Auth Check
  if (!user || !user.id) { // Ensure user.id exists
    alert("Please login first!");
    handleAuthPopup(); 
    return;
  }

  try {
    // 2. Fetch cart using the verified user.id
    let { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id) 
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!cart) {
      const { data: newCart, error: insertError } = await supabase
        .from('carts')
        .insert([{ user_id: user.id }])
        .select().single();
      
      if (insertError) throw insertError;
      cart = newCart;
    }

    // 3. Upsert item
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .maybeSingle();

// Check current stock
    const { data: productData, error: stockError } = await supabase
      .from('products')
      .select('stock_qty')
      .eq('id', product.id)
      .single();

    if (stockError) throw stockError;

    const availableStock = productData.stock_qty;

    if (availableStock <= 0) {
      alert(`Sorry! "${product.name}" is out of stock.`);
      return;
    }

    if (existingItem) {
      // Check if adding one more exceeds stock
      if (existingItem.quantity + 1 > availableStock) {
        alert(`Sorry! Only ${availableStock} unit(s) of "${product.name}" available in stock.`);
        return;
      }
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertItemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: product.id,
          quantity: 1
        });
      if (insertItemError) throw insertItemError;
    }

    window.dispatchEvent(new Event("cartUpdated"));
    alert(`${product.name} added to cart!`);
    
  } catch (error) {
    console.error("Cart Error:", error.message);
  }
};