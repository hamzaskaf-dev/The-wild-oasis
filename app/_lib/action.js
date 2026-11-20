"use server";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "./auth";
import { createGuest, getBooking, getBookings, getGuest } from "./data-service";
import supabase from "./supabase";

import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in ");

  const nationalID = formData.get("nationalID");

  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function creatBooking(bookingData, formData) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuest: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "uncomfired",
  };
  const { data, error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    throw new Error("Booking could not be created");
  }
  revalidatePath(`/cabins/${bookingData.cabinId}`);
}

export async function deleteBooking(bookingId, formData) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guesBookingIds = guestBookings.map((booking) => booking.id);

  if (!guesBookingIds.includes(bookingId))
    throw new Error("you are not allowed to delet this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("guestId", session.user.guestId)
    .select("id");

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);

  const guesBookingIds = guestBookings.map((booking) => booking.id);

  if (!guesBookingIds.includes(bookingId))
    throw new Error("you are not allowed to update this booking");

  const updateData = {
    numGuest: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  redirect("/account/reservation");
}

export async function signInAction(prevState, formData) {
  if (!formData || typeof formData.get !== "function")
    return { error: "Form data was not received." };

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError)
      return { error: "Wrong email or password." };
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
export async function signUpAction(prevState, formData) {
  if (!formData || typeof formData.get !== "function")
    return { error: "Form data was not received." };

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!fullName || !email || !password || password.length < 8)
    return { error: "Fill all fields (password min 8 characters)." };

  if (await getGuest(email)) return { error: "Email already registered." };

  const hashed = await bcrypt.hash(password, 10);
  await createGuest({ fullName, email, password: hashed });

  await signIn("credentials", { email, password, redirectTo: "/account" });
}
