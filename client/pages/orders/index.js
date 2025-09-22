const OrdersPage = ({ orders }) => {
  return (
    <ul className="list-group">
      {orders.map((order) => (
        <li className="list-group-item" key={order.id}>
          <h5>{order.ticket.title}</h5>
          <p>Price: ${order.ticket.price}</p>
          <p>Status: {order.status}</p>
        </li>
      ))}
    </ul>
  );
};

OrdersPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/orders");
  return { orders: data };
};

export default OrdersPage;
