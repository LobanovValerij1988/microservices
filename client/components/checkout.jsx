import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./checkout-form";
import axios from "axios";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const Checkout = ({ orderId, options }) => {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    axios.post("/api/payments/intent", { orderId }).then(({ data }) => {
      setClientSecret(data.clientSecret);
    });
  }, [orderId]);

  if (!clientSecret) return <div>Loading...</div>;
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
      }}
    >
      <CheckoutForm orderId={orderId} />
    </Elements>
  );
};

export default Checkout;
