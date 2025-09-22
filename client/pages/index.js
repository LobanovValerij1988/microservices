import Link from "next/link";

function Landing({ tickets }) {
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            return (
              <tr key={ticket.id}>
                <td>
                  <h3>{ticket.title}</h3>
                </td>
                <td>
                  <h4>{ticket.price}</h4>
                </td>
                <td>
                  <Link
                    href="/tickets/[ticketsId]"
                    as={`/tickets/${ticket.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Landing.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");

  return {
    tickets: data,
  };
};
export default Landing;
