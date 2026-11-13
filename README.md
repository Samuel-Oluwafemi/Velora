
  # Ecommerce UI for VELORA

  This is a code bundle for Ecommerce UI for VELORA. The original project is available at https://www.figma.com/design/onyc5pQHOXQ3WF01m5raIR/Ecommerce-UI-for-VELORA.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Product catalogue

  The storefront and admin product editor use the Firestore `products`
  collection. Admins can add and edit product details, prices, images, and
  availability from `/admin`. Product images are uploaded to Cloudinary when
  configured; otherwise, the upload function uses Firebase Storage.

  Product edits are handled by the `admin-manage-products` Netlify Function.
  Configure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
  `FIREBASE_PRIVATE_KEY` for the function, in addition to the public
  `VITE_FIREBASE_*` settings used by the app. To enable Cloudinary uploads,
  add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET` to the Netlify function environment. Get these from
  the Cloudinary Console; keep the API secret server-side and never expose it
  through a `VITE_` variable. Local Netlify development needs the same
  credentials.
  If Cloudinary isn't configured, Firebase Storage is used instead; set
  `FIREBASE_STORAGE_BUCKET` (or `VITE_FIREBASE_STORAGE_BUCKET`) and grant the
  Firebase service account permission to create Storage objects.
  Public storefront reads go through the `get-products` Netlify Function, which
  returns only catalogue fields and does not require public Firestore read access.

  Inventory status and low-stock quantities are stored on each Firestore
  product document. Product image files live in Cloudinary or Firebase Storage;
  the product document stores their download URLs. Paid order confirmation is
  always checked against Paystack by the `admin-update-order` function, while
  order fulfilment status is stored on the order document.
  