const testPost = async () => {
  const payload = {
    title: 'Test Blender',
    description: 'A great blender for testing.',
    category: 'Kitchen Appliances',
    price: 2999,
    discountPrice: 1999,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'],
    sourceMarketplaceLinks: {
      amazon: 'https://www.amazon.in/dp/testblender',
      flipkart: ''
    }
  };

  try {
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
};

testPost();
