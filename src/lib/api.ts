import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable, getFunctions } from "firebase/functions";
import { getFirebase } from "./firebase";
import {
  DEFAULT_SETTINGS,
  type Category,
  type Coupon,
  type Order,
  type OrderStatus,
  type Product,
  type StoreSettings,
  type Address,
} from "./types";

const db = () => getFirebase().db;

const withId = <T,>(d: { id: string; data: () => unknown }) =>
  ({ id: d.id, ...(d.data() as object) }) as T;

// ---------- Products ----------
export async function listProducts(
  opts: { includeInactive?: boolean } = {}
): Promise<Product[]> {
  const q = opts.includeInactive
    ? query(collection(db(), "products"))
    : query(collection(db(), "products"), where("active", "==", true));

  const snap = await getDocs(q);

  return snap.docs
    .map((d) => withId<Product>(d))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const snap = await getDocs(
    query(
      collection(db(), "products"),
      where("slug", "==", slug),
      where("active", "==", true),
      limit(1)
    )
  );

  return snap.empty ? null : withId<Product>(snap.docs[0]!);
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db(), "products", id));
  return snap.exists() ? withId<Product>(snap) : null;
}

export async function saveProduct(
  p: Partial<Product> & { id?: string },
  uid: string
) {
  const now = Date.now();
  const { id, ...data } = p;

  if (id) {
    await updateDoc(doc(db(), "products", id), {
      ...data,
      updatedAt: now,
      updatedBy: uid,
    });
    return id;
  }

  const r = await addDoc(collection(db(), "products"), {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
  });

  return r.id;
}

export async function uploadImage(
  file: File,
  folder = "products"
) {
  const r = ref(
    getFirebase().storage,
    `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`
  );

  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

// ---------- Categories ----------
export async function listCategories(
  includeInactive = false
): Promise<Category[]> {
  const snap = await getDocs(collection(db(), "categories"));

  return snap.docs
    .map((d) => withId<Category>(d))
    .filter((c) => includeInactive || c.active)
    .sort((a, b) => a.order - b.order);
}

export async function saveCategory(c: Partial<Category> & { id?: string }) {
  const { id, ...data } = c;

  if (id) {
    return updateDoc(doc(db(), "categories", id), data);
  }

  return addDoc(collection(db(), "categories"), data);
}

export async function deleteCategory(id: string) {
  const used = await getDocs(
    query(
      collection(db(), "products"),
      where("categoryId", "==", id),
      limit(1)
    )
  );

  if (!used.empty) {
    throw new Error(
      "This category still has products. Move or remove them first."
    );
  }

  await deleteDoc(doc(db(), "categories", id));
}

// ---------- Settings ----------
export async function getSettings(): Promise<StoreSettings> {
  try {
    const s = await getDoc(doc(db(), "settings", "store"));

    return {
      ...DEFAULT_SETTINGS,
      ...(s.exists() ? (s.data() as Partial<StoreSettings>) : {}),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const saveSettings = (s: StoreSettings) =>
  setDoc(doc(db(), "settings", "store"), s, { merge: true });

// ---------- Coupons ----------
export async function listCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db(), "coupons"));
  return snap.docs.map((d) => withId<Coupon>(d));
}


export async function saveCoupon(c: Partial<Coupon> & { id?: string }) {
  const { id, ...data } = c;

  const normalizedData = {
    ...data,
    ...(typeof data.code === "string"
      ? { code: data.code.toUpperCase() }
      : {}),
  };

  if (id) {
    await updateDoc(doc(db(), "coupons", id), normalizedData);
    return id;
  }

  if (!normalizedData.code) {
    throw new Error("Coupon code is required.");
  }

  await setDoc(
    doc(db(), "coupons", normalizedData.code),
    normalizedData
  );

  return normalizedData.code;
}



export async function findCoupon(code: string): Promise<Coupon | null> {
  const s = await getDoc(doc(db(), "coupons", code.toUpperCase()));

  if (!s.exists()) return null;

  const c = withId<Coupon>(s);

  if (!c.active || (c.expiresAt && c.expiresAt < Date.now())) {
    return null;
  }

  return c;
}

// ---------- Addresses ----------
export async function listAddresses(uid: string): Promise<Address[]> {
  const snap = await getDocs(collection(db(), "users", uid, "addresses"));
  return snap.docs.map((d) => withId<Address>(d));
}

export async function saveAddress(uid: string, a: Address) {
  const { id, ...data } = a;

  if (id) {
    return setDoc(doc(db(), "users", uid, "addresses", id), data);
  }

  return addDoc(collection(db(), "users", uid, "addresses"), data);
}

export const deleteAddress = (uid: string, id: string) =>
  deleteDoc(doc(db(), "users", uid, "addresses", id));

// ---------- Orders ----------
export async function listMyOrders(uid: string): Promise<Order[]> {
  if (!uid) {
    throw new Error("Please sign in to view your orders.");
  }

  // Query by user ID only, then sort locally to avoid requiring
  // a composite index on userId + createdAt.
  const snap = await getDocs(
    query(
      collection(db(), "orders"),
      where("userId", "==", uid)
    )
  );

  return snap.docs
    .map((d) => withId<Order>(d))
    .sort(
      (a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
    );
}

export async function getOrder(id: string): Promise<Order | null> {
  const s = await getDoc(doc(db(), "orders", id));
  return s.exists() ? withId<Order>(s) : null;
}

export async function listAllOrders(max = 200): Promise<Order[]> {
  const snap = await getDocs(
    query(
      collection(db(), "orders"),
      orderBy("createdAt", "desc"),
      limit(max)
    )
  );

  return snap.docs.map((d) => withId<Order>(d));
}



export async function setOrderStatus(id: string, status: OrderStatus) {
  const currentUser = getFirebase().auth.currentUser;

  if (!currentUser) {
    throw new Error("Please sign in again.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(
    `${import.meta.env["VITE_API_BASE_URL"] || "http://localhost:3000"}/api/admin/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Could not update order status.");
  }
}



// ---------- Customers & stats ----------
export async function listCustomers() {
  const snap = await getDocs(
    query(collection(db(), "users"), limit(500))
  );

  return snap.docs.map((d) =>
    withId<{
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      createdAt?: number;
    }>(d)
  );
}

export async function getSalesStats() {
  const snap = await getDocs(collection(db(), "salesStats"));

  return snap.docs
    .map((d) =>
      withId<{
        id: string;
        revenue: number;
        orders: number;
        items: number;
      }>(d)
    )
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function upsertUserProfile(
  uid: string,
  data: Record<string, unknown>
) {
  await setDoc(
    doc(db(), "users", uid),
    { ...data, lastSeen: serverTimestamp() },
    { merge: true }
  );
}

// ---------- Cloud Functions ----------
export async function callFn<T = unknown>(
  name: string,
  data: unknown
): Promise<T> {
  const fns = getFunctions(getFirebase().app, "asia-south1");
  const res = await httpsCallable(fns, name)(data);

  return res.data as T;
}
