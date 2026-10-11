"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireUnpaidOrders = exports.adminUpdateOrderStatus = exports.verifyPayment = exports.cancelPendingOrder = exports.createOrder = void 0;
exports.grantAdminToVerifiedEmail = grantAdminToVerifiedEmail;
const node_crypto_1 = require("node:crypto");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const params_1 = require("firebase-functions/params");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const KEY_ID = (0, params_1.defineSecret)("RAZORPAY_KEY_ID");
const KEY_SECRET = (0, params_1.defineSecret)("RAZORPAY_KEY_SECRET");
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const fail = (code, message) => {
    throw new https_1.HttpsError(code, message);
};
/**
 * Safely converts an unknown value to a validated string.
 */
const getText = (value, max = 200) => {
    if (typeof value !== "string") {
        throw new https_1.HttpsError("invalid-argument", "Invalid order details.");
    }
    const text = value.trim();
    if (text.length === 0 || text.length > max) {
        throw new https_1.HttpsError("invalid-argument", "Invalid order details.");
    }
    return text;
};
/**
 * Safely converts an unknown value to a validated integer.
 */
const getInt = (value, max = 100000) => {
    if (typeof value !== "number") {
        throw new https_1.HttpsError("invalid-argument", "Invalid order details.");
    }
    if (!Number.isInteger(value) ||
        value < 0 ||
        value > max) {
        throw new https_1.HttpsError("invalid-argument", "Invalid order details.");
    }
    return value;
};
/**
 * Checks whether an unknown value is a plain object.
 */
const object = (value) => {
    return (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value));
};
/**
 * Gets the authenticated user's UID.
 */
const userId = (uid) => {
    if (typeof uid !== "string" ||
        uid.length === 0) {
        throw new https_1.HttpsError("unauthenticated", "Sign in to continue.");
    }
    return uid;
};
/* -------------------------------------------------------------------------- */
/* Parse cart item                                                            */
/* -------------------------------------------------------------------------- */
const parseCartLine = (raw) => {
    if (typeof raw !== "object" ||
        raw === null ||
        Array.isArray(raw)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid item.");
    }
    const item = raw;
    const productId = getText(item["productId"]);
    const variantId = getText(item["variantId"]);
    const quantity = getInt(item["quantity"], 20);
    if (quantity < 1) {
        throw new https_1.HttpsError("invalid-argument", "Invalid quantity.");
    }
    return {
        productId,
        variantId,
        quantity,
    };
};
/* -------------------------------------------------------------------------- */
/* Firebase callable configuration                                            */
/* -------------------------------------------------------------------------- */
const CALLABLE_OPTIONS = {
    region: "asia-south1",
    cors: [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
};
/* -------------------------------------------------------------------------- */
/* Release reserved stock                                                     */
/* -------------------------------------------------------------------------- */
async function releaseStock(orderId, reason) {
    const orderRef = db.doc(`orders/${orderId}`);
    await db.runTransaction(async (tx) => {
        const orderSnap = await tx.get(orderRef);
        const orderData = orderSnap.data();
        if (!orderData ||
            orderData.paymentStatus !==
                "PENDING") {
            return;
        }
        const items = orderData.items;
        const productIds = [
            ...new Set(items.map((item) => item.productId)),
        ];
        const productRefs = productIds.map((id) => db.doc(`products/${id}`));
        const products = await tx.getAll(...productRefs);
        for (const productSnap of products) {
            if (!productSnap.exists) {
                continue;
            }
            const product = productSnap.data();
            const variants = (product.variants ?? []).map((variant) => {
                const amountToRelease = items
                    .filter((item) => item.productId ===
                    productSnap.id &&
                    item.variantId ===
                        variant.id)
                    .reduce((total, item) => total +
                    item.quantity, 0);
                if (amountToRelease === 0) {
                    return variant;
                }
                return {
                    ...variant,
                    stock: variant.stock +
                        amountToRelease,
                };
            });
            tx.update(productSnap.ref, {
                variants,
                updatedAt: Date.now(),
            });
        }
        tx.update(orderRef, {
            paymentStatus: reason,
            ...(reason === "CANCELLED"
                ? {
                    orderStatus: "CANCELLED",
                }
                : {}),
            reservationDeadline: null,
            updatedAt: Date.now(),
        });
    });
}
/* -------------------------------------------------------------------------- */
/* Create order                                                               */
/* -------------------------------------------------------------------------- */
exports.createOrder = (0, https_1.onCall)({
    ...CALLABLE_OPTIONS,
    secrets: [
        KEY_ID,
        KEY_SECRET,
    ],
}, async (req) => {
    const uid = userId(req.auth?.uid);
    if (!object(req.data)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid order data.");
    }
    const data = req.data;
    /* ---------------------------------------------------------------------- */
    /* Items                                                                  */
    /* ---------------------------------------------------------------------- */
    const rawItems = data["items"];
    if (!Array.isArray(rawItems)) {
        throw new https_1.HttpsError("invalid-argument", "Your bag is empty or invalid.");
    }
    if (rawItems.length < 1 ||
        rawItems.length > 30) {
        throw new https_1.HttpsError("invalid-argument", "Your bag is empty or too large.");
    }
    const items = rawItems.map(parseCartLine);
    /* ---------------------------------------------------------------------- */
    /* Address                                                                */
    /* ---------------------------------------------------------------------- */
    const rawAddress = data["address"];
    if (!object(rawAddress)) {
        throw new https_1.HttpsError("invalid-argument", "A delivery address is required.");
    }
    const address = {
        fullName: getText(rawAddress["fullName"]),
        phone: getText(rawAddress["phone"], 20),
        line1: getText(rawAddress["line1"]),
        line2: typeof rawAddress["line2"] ===
            "string"
            ? rawAddress["line2"].slice(0, 200)
            : "",
        city: getText(rawAddress["city"]),
        state: getText(rawAddress["state"]),
        pincode: getText(rawAddress["pincode"], 10),
    };
    /* ---------------------------------------------------------------------- */
    /* Coupon                                                                 */
    /* ---------------------------------------------------------------------- */
    const rawCouponCode = data["couponCode"];
    const couponCode = typeof rawCouponCode ===
        "string"
        ? rawCouponCode
            .toUpperCase()
            .slice(0, 40)
        : "";
    /* ---------------------------------------------------------------------- */
    /* Order reference                                                        */
    /* ---------------------------------------------------------------------- */
    const orderRef = db.collection("orders").doc();
    const deadline = Date.now() + 15 * 60_000;
    /* ---------------------------------------------------------------------- */
    /* Transaction                                                             */
    /* ---------------------------------------------------------------------- */
    const totals = await db.runTransaction(async (tx) => {
        const productIds = [
            ...new Set(items.map((item) => item.productId)),
        ];
        const productRefs = productIds.map((id) => db.doc(`products/${id}`));
        const products = await tx.getAll(...productRefs);
        const settingsRef = db.doc("settings/store");
        const settingsSnap = await tx.get(settingsRef);
        const couponRef = couponCode
            ? db.doc(`coupons/${couponCode}`)
            : undefined;
        const couponSnap = couponRef
            ? await tx.get(couponRef)
            : undefined;
        const productMap = new Map(products.map((product) => [
            product.id,
            product,
        ]));
        const cart = [];
        const updates = new Map();
        let subtotal = 0;
        /* ---------------------------------------------------------------- */
        /* Validate products and reserve stock                              */
        /* ---------------------------------------------------------------- */
        for (const item of items) {
            const productSnap = productMap.get(item.productId);
            if (!productSnap ||
                !productSnap.exists) {
                throw new https_1.HttpsError("failed-precondition", "A product in your bag is unavailable.");
            }
            const product = productSnap.data();
            if (product.active !== true ||
                product.productType !==
                    "BUY_ONLINE") {
                throw new https_1.HttpsError("failed-precondition", "A product in your bag cannot be purchased online.");
            }
            const currentVariants = updates.get(productSnap.id)?.variants ??
                product.variants ??
                [];
            const foundVariant = currentVariants.find((variant) => variant.id ===
                item.variantId);
            if (!foundVariant) {
                throw new https_1.HttpsError("failed-precondition", `Variant is unavailable for ${product.name}.`);
            }
            const selectedVariant = foundVariant;
            if (selectedVariant.stock <
                item.quantity) {
                throw new https_1.HttpsError("failed-precondition", `Not enough stock for ${product.name}.`);
            }
            /* -------------------------------------------------------------- */
            /* Price                                                           */
            /* -------------------------------------------------------------- */
            const unitPrice = product.discountPrice !==
                undefined &&
                product.discountPrice <
                    product.price
                ? product.discountPrice
                : product.price;
            if (!Number.isFinite(unitPrice) ||
                unitPrice < 0) {
                throw new https_1.HttpsError("failed-precondition", "Invalid product price.");
            }
            /* -------------------------------------------------------------- */
            /* Reserve stock                                                  */
            /* -------------------------------------------------------------- */
            const newVariants = currentVariants.map((variant) => {
                if (variant.id !==
                    selectedVariant.id) {
                    return variant;
                }
                return {
                    ...variant,
                    stock: variant.stock -
                        item.quantity,
                };
            });
            updates.set(productSnap.id, {
                ref: productSnap.ref,
                variants: newVariants,
            });
            subtotal +=
                unitPrice *
                    item.quantity;
            cart.push({
                productId: productSnap.id,
                variantId: selectedVariant.id,
                name: product.name,
                image: product.images?.[0] ??
                    "",
                sku: selectedVariant.sku,
                size: selectedVariant.size,
                color: selectedVariant.color,
                price: unitPrice,
                quantity: item.quantity,
            });
        }
        /* ---------------------------------------------------------------- */
        /* Coupon                                                           */
        /* ---------------------------------------------------------------- */
        let discount = 0;
        let actualCoupon = "";
        if (couponCode) {
            if (!couponSnap ||
                !couponSnap.exists) {
                throw new https_1.HttpsError("failed-precondition", "Coupon is no longer valid.");
            }
            const rawCoupon = couponSnap.data();
            if (!rawCoupon) {
                throw new https_1.HttpsError("failed-precondition", "Coupon is no longer valid.");
            }
            const coupon = rawCoupon;
            if (coupon.active !== true) {
                throw new https_1.HttpsError("failed-precondition", "Coupon is no longer valid.");
            }
            if (typeof coupon.expiresAt ===
                "number" &&
                coupon.expiresAt <
                    Date.now()) {
                throw new https_1.HttpsError("failed-precondition", "Coupon is no longer valid.");
            }
            const minimumOrder = typeof coupon.minOrder ===
                "number"
                ? coupon.minOrder
                : 0;
            if (subtotal <
                minimumOrder) {
                throw new https_1.HttpsError("failed-precondition", "Order does not meet the coupon minimum.");
            }
            const couponValue = typeof coupon.value ===
                "number"
                ? coupon.value
                : 0;
            if (coupon.type ===
                "PERCENT") {
                discount =
                    Math.round((subtotal *
                        couponValue) /
                        100);
            }
            else {
                discount =
                    Math.min(subtotal, couponValue);
            }
            actualCoupon =
                couponCode;
        }
        /* ---------------------------------------------------------------- */
        /* Store settings                                                   */
        /* ---------------------------------------------------------------- */
        const rawSettings = settingsSnap.data();
        const settings = rawSettings
            ? rawSettings
            : {};
        const shippingFee = typeof settings.defaultShippingFee ===
            "number"
            ? settings.defaultShippingFee
            : 99;
        const freeShippingThreshold = typeof settings.freeShippingThreshold ===
            "number"
            ? settings.freeShippingThreshold
            : 1999;
        const taxPercent = typeof settings.taxPercent ===
            "number"
            ? settings.taxPercent
            : 0;
        /* ---------------------------------------------------------------- */
        /* Calculate totals                                                 */
        /* ---------------------------------------------------------------- */
        const shipping = subtotal - discount >=
            freeShippingThreshold
            ? 0
            : shippingFee;
        const tax = Math.round(((subtotal -
            discount) *
            taxPercent) /
            100);
        const total = subtotal -
            discount +
            shipping +
            tax;
        /* ---------------------------------------------------------------- */
        /* Update reserved products                                         */
        /* ---------------------------------------------------------------- */
        for (const update of updates.values()) {
            tx.update(update.ref, {
                variants: update.variants,
                updatedAt: Date.now(),
            });
        }
        /* ---------------------------------------------------------------- */
        /* Payment mode                                                     */
        /* ---------------------------------------------------------------- */
        const paymentMethod = KEY_ID.value() &&
            KEY_SECRET.value()
            ? "RAZORPAY"
            : "MOCK";
        /* ---------------------------------------------------------------- */
        /* Create Firestore order                                            */
        /* ---------------------------------------------------------------- */
        tx.create(orderRef, {
            userId: uid,
            customerEmail: req.auth?.token
                .email ?? "",
            items: cart,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            ...(actualCoupon
                ? {
                    couponCode: actualCoupon,
                }
                : {}),
            paymentStatus: "PENDING",
            orderStatus: "PLACED",
            shippingAddress: address,
            paymentMethod,
            reservationDeadline: deadline,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            statusHistory: [
                {
                    status: "PLACED",
                    at: Date.now(),
                },
            ],
        });
        return {
            total,
        };
    });
    /* ---------------------------------------------------------------------- */
    /* Mock payment                                                           */
    /* ---------------------------------------------------------------------- */
    if (!KEY_ID.value() ||
        !KEY_SECRET.value()) {
        return {
            orderId: orderRef.id,
            amount: totals.total,
            mode: "MOCK",
        };
    }
    /* ---------------------------------------------------------------------- */
    /* Razorpay                                                               */
    /* ---------------------------------------------------------------------- */
    try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${KEY_ID.value()}:${KEY_SECRET.value()}`).toString("base64")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: totals.total * 100,
                currency: "INR",
                receipt: orderRef.id.slice(0, 40),
                notes: {
                    firebaseOrderId: orderRef.id,
                },
            }),
        });
        if (!response.ok) {
            throw new Error("Payment gateway error");
        }
        const paymentOrder = (await response.json());
        if (!paymentOrder.id ||
            typeof paymentOrder.id !==
                "string") {
            throw new Error("Invalid Razorpay order response.");
        }
        await orderRef.update({
            razorpayOrderId: paymentOrder.id,
            updatedAt: Date.now(),
        });
        return {
            orderId: orderRef.id,
            amount: totals.total,
            mode: "RAZORPAY",
            razorpayOrderId: paymentOrder.id,
            keyId: KEY_ID.value(),
        };
    }
    catch {
        await releaseStock(orderRef.id, "FAILED");
        throw new https_1.HttpsError("internal", "Payment could not be started.");
    }
});
/* -------------------------------------------------------------------------- */
/* Cancel pending order                                                       */
/* -------------------------------------------------------------------------- */
exports.cancelPendingOrder = (0, https_1.onCall)(CALLABLE_OPTIONS, async (req) => {
    const uid = userId(req.auth?.uid);
    if (!object(req.data)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid order.");
    }
    const data = req.data;
    const orderId = getText(data["orderId"]);
    const ref = db.doc(`orders/${orderId}`);
    const snap = await ref.get();
    const order = snap.data();
    if (!order ||
        order.userId !== uid) {
        throw new https_1.HttpsError("not-found", "Order not found.");
    }
    await releaseStock(orderId, "CANCELLED");
    return {
        ok: true,
    };
});
/* -------------------------------------------------------------------------- */
/* Verify payment                                                             */
/* -------------------------------------------------------------------------- */
exports.verifyPayment = (0, https_1.onCall)({
    ...CALLABLE_OPTIONS,
    secrets: [KEY_SECRET],
}, async (req) => {
    const uid = userId(req.auth?.uid);
    if (!object(req.data)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid payment response.");
    }
    const data = req.data;
    const orderId = getText(data["orderId"]);
    const razorpayOrderId = getText(data["razorpay_order_id"]);
    const paymentId = getText(data["razorpay_payment_id"]);
    const signature = getText(data["razorpay_signature"], 512);
    const ref = db.doc(`orders/${orderId}`);
    const snap = await ref.get();
    const order = snap.data();
    if (!order ||
        order.userId !== uid ||
        order.razorpayOrderId !==
            razorpayOrderId ||
        order.paymentStatus !==
            "PENDING") {
        throw new https_1.HttpsError("failed-precondition", "Order cannot be verified.");
    }
    const expected = (0, node_crypto_1.createHmac)("sha256", KEY_SECRET.value())
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest();
    const provided = Buffer.from(signature, "hex");
    if (expected.length !==
        provided.length ||
        !(0, node_crypto_1.timingSafeEqual)(expected, provided)) {
        throw new https_1.HttpsError("permission-denied", "Payment verification failed.");
    }
    await db.runTransaction(async (tx) => {
        const current = await tx.get(ref);
        const currentOrder = current.data();
        if (!currentOrder) {
            throw new https_1.HttpsError("failed-precondition", "Order has already been updated.");
        }
        const safeOrder = currentOrder;
        if (safeOrder.paymentStatus !==
            "PENDING" ||
            safeOrder.userId !== uid) {
            throw new https_1.HttpsError("failed-precondition", "Order has already been updated.");
        }
        const month = new Date()
            .toISOString()
            .slice(0, 7);
        const statsRef = db.doc(`salesStats/${month}`);
        const stats = await tx.get(statsRef);
        const items = safeOrder.items;
        const previousStats = stats.data() ?? {};
        const revenue = typeof previousStats.revenue ===
            "number"
            ? previousStats.revenue
            : 0;
        const orders = typeof previousStats.orders ===
            "number"
            ? previousStats.orders
            : 0;
        const itemCount = typeof previousStats.items ===
            "number"
            ? previousStats.items
            : 0;
        tx.update(ref, {
            paymentStatus: "PAID",
            razorpayPaymentId: paymentId,
            reservationDeadline: null,
            updatedAt: Date.now(),
        });
        tx.set(statsRef, {
            revenue: revenue +
                safeOrder.total,
            orders: orders + 1,
            items: itemCount +
                items.reduce((total, item) => total +
                    item.quantity, 0),
        }, {
            merge: true,
        });
    });
    return {
        ok: true,
    };
});
/* -------------------------------------------------------------------------- */
/* Admin update order status                                                  */
/* -------------------------------------------------------------------------- */
exports.adminUpdateOrderStatus = (0, https_1.onCall)(CALLABLE_OPTIONS, async (req) => {
    userId(req.auth?.uid);
    if (req.auth?.token
        .admin !== true) {
        throw new https_1.HttpsError("permission-denied", "Admin access required.");
    }
    if (!object(req.data)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid order status.");
    }
    const data = req.data;
    const orderId = getText(data["orderId"]);
    const statusValue = getText(data["status"], 30);
    const validStatuses = [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ];
    if (!validStatuses.includes(statusValue)) {
        throw new https_1.HttpsError("invalid-argument", "Invalid status.");
    }
    const status = statusValue;
    const ref = db.doc(`orders/${orderId}`);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const old = snap.data();
        if (!old) {
            throw new https_1.HttpsError("not-found", "Order not found.");
        }
        const oldStatus = old.orderStatus;
        if (oldStatus ===
            "DELIVERED" ||
            oldStatus ===
                "CANCELLED") {
            throw new https_1.HttpsError("failed-precondition", "Completed orders cannot be changed.");
        }
        tx.update(ref, {
            orderStatus: status,
            updatedAt: Date.now(),
            statusHistory: firestore_1.FieldValue.arrayUnion({
                status,
                at: Date.now(),
                by: req.auth?.uid,
            }),
        });
    });
    return {
        ok: true,
    };
});
/* -------------------------------------------------------------------------- */
/* Expire unpaid orders                                                       */
/* -------------------------------------------------------------------------- */
exports.expireUnpaidOrders = (0, scheduler_1.onSchedule)({
    schedule: "every 10 minutes",
    region: "asia-south1",
}, async () => {
    const expired = await db
        .collection("orders")
        .where("paymentStatus", "==", "PENDING")
        .where("reservationDeadline", "<", Date.now())
        .limit(100)
        .get();
    for (const order of expired.docs) {
        await releaseStock(order.id, "EXPIRED");
    }
});
/* -------------------------------------------------------------------------- */
/* Grant admin                                                                */
/* -------------------------------------------------------------------------- */
async function grantAdminToVerifiedEmail(email) {
    const user = await (0, auth_1.getAuth)().getUserByEmail(email);
    if (!user.emailVerified) {
        throw new Error("Verify the owner's email before granting admin.");
    }
    await (0, auth_1.getAuth)().setCustomUserClaims(user.uid, {
        ...(user.customClaims ?? {}),
        admin: true,
    });
}
