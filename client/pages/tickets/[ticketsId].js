import { useRequest } from "../../hooks/useRequest";
import Router from "next/router";

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: { ticketId: ticket.id },
    onSuccess: ({ order }) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      <button onClick={doRequest} className="btn btn-primary">
        Purchase
      </button>
      {errors}
    </div>
  );
};

TicketShow.getInitialProps = async (appContext, client) => {
  const { data } = await client.get(
    "/api/tickets/" + appContext.query.ticketsId
  );

  return {
    ticket: data,
  };
};

export default TicketShow;
