export default function GoogleSignIn() {
    return (
      <form method="get" action="/auth">
        <button type="submit">Sign in with Google</button>
      </form>
    );
}