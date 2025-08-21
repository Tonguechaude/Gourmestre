import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LandingProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

const Landing: React.FC<LandingProps> = ({}) => {
  const navigate = useNavigate();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate("/dashboard");
    }
  }, [authenticated, loading, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-primary)",
          backgroundColor: "rgb(var(--color-background))",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(var(--color-accent), 0.2)",
              borderTop: "3px solid rgb(var(--color-accent))",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p className="text-body-sm">Chargement...</p>
        </div>
      </div>
    );
  }
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
          maxWidth: "32rem",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "var(--space-3xl)" }}>
          <h1
            className="text-display"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            Bienvenue sur <br />
            <span style={{ color: "rgb(var(--color-accent))" }}>
              Gourmestre
            </span>
          </h1>
          <p
            className="text-body"
            style={{ maxWidth: "24rem", margin: "0 auto" }}
          >
            Découvrez, notez et organisez vos restaurants favoris en toute
            simplicité. Votre carnet de bord culinaire personnel.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary"
            style={{ width: "100%" }}
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
            Se connecter
          </button>

          <button
            onClick={() => navigate("/register")}
            className="btn btn-secondary"
            style={{ width: "100%" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
