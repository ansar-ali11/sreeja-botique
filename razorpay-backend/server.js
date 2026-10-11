
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const app = express();

const serviceAccount = require("./service-account.json");

initializeApp({
  credential: cert(serviceAccount),
  projectId: "sreejas-bridal-boutique",
});

const db = getFirestore();

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:8080,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as local health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const token = authorization.slice(7);
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/firebase-check", async (req, res) => {
  try {
    await db.collection("settings").doc("store").get();

    res.json({ status: "firebase-connected" });
  } catch (error) {
    console.error("Firebase check failed:", error.message);

    res.status(500).json({
      error: "Firebase connection failed",
    });
  }
});

app.post("/api/auth-check", requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    uid: req.user.uid,
  });
});

// Cash on Delivery order creation
app.post("/api/orders/cod", requireAuth, async (req, res) => {
  try {
    const { items, address, couponCode } = req.body || {};

    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return res.status(400).json({ error: "Invalid cart items." });
    }

    if (
      !address ||
      typeof address.fullName !== "string" ||
      typeof address.phone !== "string" ||
      typeof address.line1 !== "string" ||
      typeof address.city !== "string" ||
      typeof address.state !== "string" ||
      typeof address.pincode !== "string" ||
      !address.fullName.trim() ||
      !address.phone.trim() ||
      !address.line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      return res.status(400).json({
        error: "A complete delivery address is required.",
      });
    }

    const cleanItems = items.map((item) => ({
      productId: typeof item.productId === "string" ? item.productId : "",
      variantId: typeof item.variantId === "string" ? item.variantId : "",
      quantity: item.quantity,
    }));

    if (
      cleanItems.some(
        (item) =>
          !item.productId ||
          !item.variantId ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 20
      ) ||
      new Set(
        cleanItems.map((item) => `${item.productId}:${item.variantId}`)
      ).size !== cleanItems.length
    ) {
      return res.status(400).json({
        error: "Invalid or duplicate cart items.",
      });
    }

    const normalizedCoupon =
      typeof couponCode === "string" && couponCode.trim()
        ? couponCode.trim().toUpperCase()
        : null;

    const orderRef = db.collection("orders").doc();
    const settingsRef = db.collection("settings").doc("store");
    const productRefs = cleanItems.map((item) =>
      db.collection("products").doc(item.productId)
    );

    const result = await db.runTransaction(async (transaction) => {
      // Read all required documents before writing.
      const settingsSnap = await transaction.get(settingsRef);

      const productSnaps = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      let coupon = null;

      if (normalizedCoupon) {
        const couponQuery = db
          .collection("coupons")
          .where("code", "==", normalizedCoupon)
          .limit(1);

        const couponSnap = await transaction.get(couponQuery);

        if (!couponSnap.empty) {
          coupon = couponSnap.docs[0].data();
        }
      }

      const settings = settingsSnap.exists ? settingsSnap.data() : {};

      const defaultShippingFee = Number(
        settings.defaultShippingFee ?? 99
      );
      const freeShippingThreshold = Number(
        settings.freeShippingThreshold ?? 1999
      );
      const taxPercent = Number(settings.taxPercent ?? 0);

      if (
        !Number.isFinite(defaultShippingFee) ||
        defaultShippingFee < 0 ||
        !Number.isFinite(freeShippingThreshold) ||
        freeShippingThreshold < 0 ||
        !Number.isFinite(taxPercent) ||
        taxPercent < 0
      ) {
        throw new Error("Store pricing settings are invalid.");
      }

      const orderItems = [];
      const stockUpdates = [];
      let subtotal = 0;

      for (let index = 0; index < cleanItems.length; index++) {
        const requested = cleanItems[index];
        const productSnap = productSnaps[index];

        if (!productSnap.exists) {
          throw new Error(
            "A product in your cart is no longer available."
          );
        }

        const product = productSnap.data();

        if (
          product.active !== true ||
          product.productType !== "BUY_ONLINE"
        ) {
          throw new Error(
            `${product.name || "A product"} is not available to buy online.`
          );
        }

        const variants = Array.isArray(product.variants)
          ? product.variants
          : [];

        const variantIndex = variants.findIndex(
          (variant) => variant.id === requested.variantId
        );

        if (variantIndex < 0) {
          throw new Error(
            `A selected variant of ${product.name} is unavailable.`
          );
        }

        const variant = variants[variantIndex];
        const stock = Number(variant.stock);

        if (
          !Number.isInteger(stock) ||
          stock < requested.quantity
        ) {
          throw new Error(`Insufficient stock for ${product.name}.`);
        }

        const regularPrice = Number(product.price);
        const salePrice = Number(product.discountPrice);

        const price =
          Number.isFinite(salePrice) &&
          salePrice > 0 &&
          salePrice < regularPrice
            ? salePrice
            : regularPrice;

        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`Invalid price for ${product.name}.`);
        }

        subtotal += price * requested.quantity;

        orderItems.push({
          productId: productSnap.id,
          variantId: variant.id,
          name: product.name,
          image: Array.isArray(product.images)
            ? product.images[0] || ""
            : "",
          sku: variant.sku || "",
          size: variant.size || "",
          color: variant.color || "",
          price,
          quantity: requested.quantity,
        });

        const updatedVariants = variants.map((entry, i) =>
          i === variantIndex
            ? { ...entry, stock: stock - requested.quantity }
            : entry
        );

        stockUpdates.push({
          ref: productRefs[index],
          variants: updatedVariants,
        });
      }

      let discount = 0;

      if (normalizedCoupon) {
        if (!coupon || coupon.active !== true) {
          throw new Error("This coupon is invalid or inactive.");
        }

        if (
          coupon.expiresAt != null &&
          Number(coupon.expiresAt) < Date.now()
        ) {
          throw new Error("This coupon has expired.");
        }

        if (
          coupon.minOrder != null &&
          subtotal < Number(coupon.minOrder)
        ) {
          throw new Error(
            "Your order does not meet this coupon's minimum value."
          );
        }

        const couponValue = Number(coupon.value);

        if (!Number.isFinite(couponValue) || couponValue < 0) {
          throw new Error("This coupon has an invalid value.");
        }

        if (coupon.type === "PERCENT") {
          if (couponValue > 100) {
            throw new Error("This coupon has an invalid percentage.");
          }

          discount = (subtotal * couponValue) / 100;
        } else if (
          coupon.type === "FLAT" ||
          coupon.type === "FIXED"
        ) {
          discount = couponValue;
        } else {
          throw new Error("This coupon type is not supported.");
        }

        discount = Math.min(discount, subtotal);
      }

      const shipping =
        subtotal - discount >= freeShippingThreshold
          ? 0
          : defaultShippingFee;

      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = (taxableAmount * taxPercent) / 100;

      const total =
        Math.round((taxableAmount + shipping + tax) * 100) / 100;

      const now = Date.now();

      const shippingAddress = {
        id: typeof address.id === "string" ? address.id : "",
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        line1: address.line1.trim(),
        line2:
          typeof address.line2 === "string"
            ? address.line2.trim()
            : "",
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        isDefault: address.isDefault === true,
      };

      for (const update of stockUpdates) {
        transaction.update(update.ref, {
          variants: update.variants,
        });
      }

      const order = {
        userId: req.user.uid,
        customerEmail: req.user.email,
        items: orderItems,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        ...(normalizedCoupon
          ? { couponCode: normalizedCoupon }
          : {}),
        paymentStatus: "PENDING",
        paymentMethod: "COD",
        orderStatus: "PLACED",
        shippingAddress,
        createdAt: now,
        updatedAt: now,
        statusHistory: [{ status: "PLACED", at: now }],
      };

      transaction.create(orderRef, order);

      return {
        orderId: orderRef.id,
        total,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("COD order creation failed:", error.message);

    const message = error.message || "Could not place your order.";

    const status =
      /cart|product|variant|stock|coupon|order|address|available|expired|pricing|price/i.test(
        message
      )
        ? 400
        : 500;

    return res.status(status).json({
      error:
        status === 400
          ? message
          : "Could not place your order. Please try again.",
    });
  }
});


app.patch("/api/admin/orders/:id/status", requireAuth, async (req, res) => {
  try {
    // Verify the Firebase user's admin custom claim.
    const user = await getAuth().getUser(req.user.uid);

    if (user.customClaims?.admin !== true) {
      return res.status(403).json({ error: "Admin access required." });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const now = Date.now();

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(orderRef);

      if (!snapshot.exists) {
        const error = new Error("Order not found.");
        error.statusCode = 404;
        throw error;
      }

      const order = snapshot.data();

      if (
        order.orderStatus === "DELIVERED" ||
        order.orderStatus === "CANCELLED"
      ) {
        const error = new Error("Completed orders cannot be changed.");
        error.statusCode = 400;
        throw error;
      }

      transaction.update(orderRef, {
        orderStatus: status,
        updatedAt: now,
        statusHistory: [
          ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
          { status, at: now, by: req.user.uid },
        ],
      });
    });

    return res.json({ success: true, orderId, status });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Admin order status update failed:", error.message);
    return res.status(500).json({ error: "Could not update order status." });
  }
});

// Return a JSON error for unexpected CORS or server errors.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed by CORS." });
  }

  console.error("Server error:", error.message);

  return res.status(500).json({ error: "Internal server error." });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});