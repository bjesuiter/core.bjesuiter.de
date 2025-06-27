export function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <button type="submit">Logout</button>
    </form>
  );
}
