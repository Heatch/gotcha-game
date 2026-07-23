import LoginForm from '../components/LoginForm';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  return (
    <div className="page login-page">
      <ThemeToggle />
      <header className="login-header">
        <h1>gotcha!</h1>
        <p className="subtitle">made by heatch</p>
      </header>
      <LoginForm />
    </div>
  );
}
