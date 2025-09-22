import Checkout from "../../components/checkout";
import OrderInfo from "./components/OrderInfo";

const OrderShow = ({ order }) => {
  return (
    <div>
      <OrderInfo order={order} />
      <Checkout orderId={order.id} />
    </div>
  );
};

OrderShow.getInitialProps = async (appContext, client) => {
  const { data } = await client.get("/api/orders/" + appContext.query.orderId);

  return {
    order: data,
  };
};

export default OrderShow;
