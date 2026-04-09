export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    approved: user.approved,
    rejected: Boolean(user.rejected),
    addressFormatted: user.addressFormatted || "",
    addressLat: user.addressLat,
    addressLng: user.addressLng,
    createdAt: user.createdAt
  };
}
