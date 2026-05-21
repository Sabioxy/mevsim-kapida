async function testSellerDeleteFlow() {
  console.log("Starting seller product integration test...");

  // 1. Log in as seller
  console.log("1. Logging in as seller...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "uretici@mevsim.com",
      password: "password123"
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status}`);
  }

  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No session cookie returned");
  }

  // 2. Create a temporary product
  console.log("2. Creating temporary product...");
  const createRes = await fetch("http://localhost:3000/api/seller/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": setCookie
    },
    body: JSON.stringify({
      name: "Gecici Silme Testi",
      description: "Bu urun test amacli olusturulmustur.",
      category: "taze-sebze",
      image: "/images/test.jpg",
      skus: [
        {
          label: "1kg",
          grams: 1000,
          priceCents: 1500,
          stock: 10
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Product creation failed: ${createRes.status}, response: ${errorText}`);
  }

  const createdData = await createRes.json();
  const productId = createdData.product.id;
  console.log(`Product created successfully! ID: ${productId}`);

  // 3. Delete the temporary product
  console.log(`3. Deleting product with ID: ${productId}...`);
  const deleteRes = await fetch(`http://localhost:3000/api/seller/products/${productId}`, {
    method: "DELETE",
    headers: {
      "Cookie": setCookie
    }
  });

  if (!deleteRes.ok) {
    const errorText = await deleteRes.text();
    throw new Error(`Product deletion failed: ${deleteRes.status}, response: ${errorText}`);
  }

  const deleteData = await deleteRes.json();
  console.log("Delete response:", deleteData);

  if (!deleteData.success) {
    throw new Error("Deletion response was not successful");
  }

  console.log("\nSUCCESS: Seller product deletion integration test passed!");
}

testSellerDeleteFlow().catch(err => {
  console.error("\nTEST FAILED:", err.message);
  process.exit(1);
});
