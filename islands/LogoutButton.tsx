export function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <button class="button" type="submit">Logout</button>
    </form>
  );
}
