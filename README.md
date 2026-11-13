
  # Ecommerce UI for VELORA

  This is a code bundle for Ecommerce UI for VELORA. The original project is available at https://www.figma.com/design/onyc5pQHOXQ3WF01m5raIR/Ecommerce-UI-for-VELORA.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Product catalogue

  The storefront and admin product editor use the Firestore `products`
  collection. Admins can add and edit product details, prices, images, and
  availability from `/admin`. Product image uploads are stored in Firebase
  Storage; configure `FIREBASE_STORAGE_BUCKET` in Netlify and grant the
  Firebase service account permission to create Storage objects. The bucket
  must be enabled in the Firebase project.

  Product edits are handled by the `admin-manage-products` Netlify Function.
  Configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
  `FIREBASE_PRIVATE_KEY` for the function, in addition to the public
  `VITE_FIREBASE_*` settings used by the app. Local Netlify development also
  needs those server-side credentials and `FIREBASE_STORAGE_BUCKET` (or the
  configured `VITE_FIREBASE_STORAGE_BUCKET` fallback) for image uploads.
  Public storefront reads go through the `get-products` Netlify Function, which
  returns only catalogue fields and does not require public Firestore read access.

  Inventory status and low-stock quantities are stored on each Firestore
  product document. Product image files live in Firebase Storage; the product
  document stores their download URLs. Paid order confirmation is always
  checked against Paystack by the `admin-update-order` function, while order
  fulfilment status is stored on the order document.
  