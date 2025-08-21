import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {
  onSwitchToRegister?: () => void;
  showWelcomeMessage?: boolean;
}

const Login: React.FC<LoginProps> = ({ showWelcomeMessage = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await login(formData);

      // Successful login - redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Erreur de connexion";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-primary)",
        backgroundColor: "rgb(var(--color-background))",
        padding: "1rem",
      }}
    >
      <div
        className="card hover-lift animate-fade-in-up"
        style={{
          padding: "var(--space-2xl)",
          maxWidth: "28rem",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
          <h1
            className="text-display"
            style={{ marginBottom: "var(--space-sm)" }}
          >
            Gourmestre
          </h1>
          <p className="text-body-sm">Connectez-vous à votre compte</p>
        </div>

        {showWelcomeMessage && (
          <div
            className="animate-fade-in"
            style={{
              background: "rgba(var(--color-success), 0.1)",
              border: "1px solid rgba(var(--color-success), 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                color: "rgb(var(--color-success))",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: "0.125rem" }}
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                Votre compte a été créé avec succès ! Vous pouvez maintenant
                vous connecter.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Nom d'utilisateur"
              className="form-input"
              required
            />
            <label className="form-label">Nom d'utilisateur</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mot de passe"
              className="form-input"
              required
            />
            <label className="form-label">Mot de passe</label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading-state" : ""}`}
            style={{ width: "100%" }}
            disabled={loading}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10,17 15,12 10,7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <div
            className="text-center animate-fade-in"
            style={{
              color: "rgb(var(--color-error))",
              marginTop: "var(--space-md)",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "var(--space-2xl)",
            paddingTop: "var(--space-lg)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <p className="text-body-sm">
            Pas encore de compte ?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
