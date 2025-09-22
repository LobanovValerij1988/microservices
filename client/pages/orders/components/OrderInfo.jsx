import { useEffect, useState } from "react";

const OrderInfo = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const intervalId = setInterval(findTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, []);
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }
  return <div>{timeLeft} seconds left until order expiresAt</div>;
};
export default OrderInfo;
