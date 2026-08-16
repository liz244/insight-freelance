import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate,} from "react-router-dom";
import { useState, useEffect } from "react";
import API from "./api";
import {
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaFacebookF,
  FaXTwitter,
  FaMagnifyingGlass,
  FaBriefcase,
  FaCheck,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaShieldHalved,
} from "react-icons/fa6";
const CATEGORIES = ["Développement", "Design", "Beauté", "Photo", "Marketing"];

const AVAILABILITY_OPTIONS = [
  "Disponible maintenant",
  "Disponible sous 2 semaines",
  "Disponible sous 1 mois",
  "Non disponible",
];

const FRENCH_CITIES = [
  "Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre",
  "Créteil", "Argenteuil", "Montreuil", "Asnières-sur-Seine", "Colombes",
  "Aubervilliers", "Levallois-Perret", "Issy-les-Moulineaux", "Rueil-Malmaison",
  "Antony", "Vitry-sur-Seine", "Champigny-sur-Marne", "Clichy", "Ivry-sur-Seine",
  "Neuilly-sur-Seine", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes",
  "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes",
];
function PasswordInput({
  value,
  onChange,
  placeholder = "Mot de passe",
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className="input pr-10"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1 text-yellow-500 text-lg">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange && onChange(s)}
          aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          {s <= value ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  );
}

function ReviewBox({ requestId }: { requestId: string }) {
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    const check = async () => {
      try {
        const res = await API.get(`/reviews/request/${requestId}/mine`, authHeader());
        setHasReviewed(res.data.has_reviewed);
      } catch {
        setHasReviewed(false);
      }
    };
    check();
  }, [requestId]);

  const submitReview = async () => {
    if (rating === 0) {
      alert("Choisissez une note avant d'envoyer.");
      return;
    }
    setSubmitting(true);
    try {
      await API.post(
        `/reviews/${requestId}`,
        { rating, comment: comment || null },
        authHeader()
      );
      setHasReviewed(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  if (hasReviewed === null) return null;

  if (hasReviewed) {
    return (
      <p className="mt-4 text-sm text-green-600 font-medium">
        ✓ Avis envoyé, merci !
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
      <p className="text-sm font-medium text-gray-700">Laisser un avis</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        className="input min-h-20"
        placeholder="Un commentaire (optionnel)" aria-label="Un commentaire (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        onClick={submitReview}
        disabled={submitting}
        className="btn-primary text-sm"
      >
        Envoyer l'avis
      </button>
    </div>
  );
}

function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const fullUrl = `${API.defaults.baseURL}${res.data.url}`;
      onChange(fullUrl);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600 block">{label}</label>

      <div className="flex items-center gap-4">
        {value && (
          <img
              loading="lazy"
            src={value}
            alt="Aperçu"
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
        )}

        <label className="btn-secondary cursor-pointer text-sm">
          {uploading ? "Envoi en cours..." : "Choisir une image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-white/80 backdrop-blur border-b border-indigo-100">
        <Link
          to="/"
          className="text-lg md:text-2xl font-bold text-indigo-700 shrink-0"
        >
          Insight Freelance
        </Link>

        <div className="flex gap-2 md:gap-4 items-center">
          <Link
            to="/freelances"
            className="text-sm md:text-base text-gray-700 hover:text-indigo-600 transition hidden sm:block"
          >
            Freelances
          </Link>

          <Link
            to="/login"
            className="text-sm md:text-base text-gray-700 hover:text-indigo-600 transition"
          >
            Connexion
          </Link>

          <Link
            to="/register"
            className="text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-semibold transition whitespace-nowrap"
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold max-w-5xl mx-auto text-gray-900 leading-tight">
          Trouvez le freelance idéal pour votre projet
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
          Designers, développeurs, experts beauté et créatifs réunis sur une
          plateforme moderne pour présenter leurs services et recevoir des demandes.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 md:mt-10">
          <Link
            to="/freelances"
            className="btn-primary"
          >
            Explorer les freelances
          </Link>

          <Link
            to="/register"
            className="btn-secondary"
          >
            Créer mon profil
          </Link>
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 md:py-14">
        <h2 className="section-title text-center mb-8 md:mb-10">
          Catégories populaires
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5 max-w-6xl mx-auto">

          {[
            "Développement",
            "Design",
            "Beauté",
            "Photo",
            "Marketing",
          ].map((cat) => (
            <div
              key={cat}
              className="card text-center hover:shadow-lg hover:-translate-y-1 transition p-4 md:p-6"
            >
              <p className="font-semibold text-gray-800 text-sm md:text-base leading-tight">
                {cat}
              </p>
            </div>
          ))}

        </div>
      </section>

      <section className="px-4 md:px-8 py-12 md:py-16 bg-white border-y border-indigo-100">

        <h2 className="section-title text-center mb-8 md:mb-10">
          Comment ça marche ?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          <div className="card">
            <h3 className="font-bold text-xl text-indigo-700">
              1. Créez votre profil
            </h3>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Ajoutez vos informations, services et réalisations pour présenter votre activité.
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-xl text-indigo-700">
              2. Partagez votre page
            </h3>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Votre page publique permet aux clients de découvrir votre univers.
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-xl text-indigo-700">
              3. Recevez des demandes
            </h3>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Gérez vos demandes et votre activité directement depuis votre dashboard.
            </p>
          </div>

        </div>
      </section>

      
      <Footer />

    </div>
  );
}
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      const meRes = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });

      if (meRes.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 flex items-center justify-center">
      <div className="w-full max-w-sm">

        <Link to="/" className="inline-block mb-6 text-indigo-600 hover:underline">
          ← Retour à l'accueil
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-indigo-700">
            Insight Freelance
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-6">
            Bon retour parmi nous
          </h1>
          <p className="text-gray-600 mt-2">
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>

        <div className="card space-y-4">
          <input
            className="input"
            type="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Email" aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <PasswordInput
            value={password}
            onChange={setPassword}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button className="btn-primary w-full" onClick={handleLogin}>
            Se connecter
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
}
function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"client" | "freelance" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!role) {
      alert("Choisis d'abord ton profil : client ou freelance.");
      return;
    }

    try {
      await API.post("/auth/register", {
        email,
        password,
        role,
      });

      alert("Compte créé ! Connecte-toi maintenant.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Erreur inscription");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl">

        <Link to="/" className="inline-block mb-6 text-indigo-600 hover:underline">
          ← Retour à l'accueil
        </Link>

        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
            Bienvenue
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            Qui êtes-vous, aujourd'hui ?
          </h1>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            Le parcours n'est pas le même selon que vous cherchez un freelance
            ou que vous proposez vos services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <button
            type="button"
            onClick={() => setRole("client")}
            className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-white relative
              ${role === "client"
                ? "border-indigo-600 shadow-lg shadow-indigo-100 -translate-y-1"
                : "border-gray-200 hover:border-indigo-300 hover:-translate-y-0.5"}
            `}
          >
            {role === "client" && (
              <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                <FaCheck />
              </span>
            )}

            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl mb-4">
              <FaMagnifyingGlass />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Je cherche un freelance
            </h2>

            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Découvrez des profils, échangez avec eux et suivez votre
              demande jusqu'à la livraison.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole("freelance")}
            className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-white relative
              ${role === "freelance"
                ? "border-pink-500 shadow-lg shadow-pink-100 -translate-y-1"
                : "border-gray-200 hover:border-pink-300 hover:-translate-y-0.5"}
            `}
          >
            {role === "freelance" && (
              <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">
                <FaCheck />
              </span>
            )}

            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl mb-4">
              <FaBriefcase />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Je propose mes services
            </h2>

            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Créez votre vitrine professionnelle et recevez des demandes
              qualifiées de clients.
            </p>
          </button>

        </div>

        {role && (
          <div className="card mt-8 space-y-4 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-gray-900">
              {role === "client"
                ? "Créer mon compte client"
                : "Créer mon compte freelance"}
            </h3>

            <input
              className="input"
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Email" aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput value={password} onChange={setPassword} />

            <button
              className="btn-primary w-full"
              onClick={handleRegister}
            >
              {role === "client"
                ? "Créer mon compte client"
                : "Créer mon compte freelance"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
function ProfileDetail() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileRes = await API.get(`/profile/${slug}`);
      setProfile(profileRes.data);

      const servicesRes = await API.get(`/services/${slug}`);
      setServices(servicesRes.data);

      const portfolioRes = await API.get(`/portfolio/${slug}`);
      setPortfolioImages(portfolioRes.data);

      const reviewsRes = await API.get(`/reviews/profile/${profileRes.data.id}`);
      setReviews(reviewsRes.data);
    };

    fetchProfile();
  }, [slug]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

const sendRequest = async () => {
    const token = localStorage.getItem("token");

    await API.post(
      "/requests/create",
      {
        freelancer_slug: slug,
        service_id: selectedServiceId || null,
        client_name: clientName,
        client_email: clientEmail,
        message: message,
        desired_date: desiredDate || null,
      },
      token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {}
    );

    alert("Demande envoyée !");
    setClientName("");
    setClientEmail("");
    setMessage("");
    setSelectedServiceId("");
    setDesiredDate("");
  };

  if (!profile) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex items-center justify-between flex-wrap gap-3">
  {localStorage.getItem("token") ? (
  <Link to="/dashboard" className="text-indigo-600 hover:underline">
    ← Retour au dashboard
  </Link>
) : (
  <Link to="/freelances" className="text-indigo-600 hover:underline">
    ← Retour aux freelances
  </Link>
)}
</div>

        <div className="card flex flex-col md:flex-row gap-8 items-start">
          {profile.avatar_url && (
            <img
              loading="lazy"
              src={profile.avatar_url}
              alt={`Photo de profil de ${profile.name}`}
              className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100"
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
              {profile.verified && (
                <span
                  title="Profil vérifié par l'équipe Insight Freelance"
                  className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full"
                >
                  <FaShieldHalved /> Vérifié
                </span>
              )}
            </div>
            <p className="text-xl text-indigo-600 font-medium">{profile.title}</p>

            {averageRating !== null && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(averageRating)} />
                <span className="text-gray-600 text-sm">
                  {averageRating.toFixed(1)} / 5 ({reviews.length} avis)
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                {profile.category}
              </span>

              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                {profile.city}
              </span>

              {profile.experience_years && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {profile.experience_years}
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {profile.availability && (
              <p className="text-gray-600">
                <span className="font-semibold">Disponibilité :</span> {profile.availability}
              </p>
            )}

            {profile.starting_price && (
              <p className="text-gray-600">
                <span className="font-semibold">Tarif :</span> {profile.starting_price}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  LinkedIn
                </a>
              )}

              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Portfolio
                </a>
              )}

              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  GitHub
                </a>
              )}

              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Services</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="font-bold text-lg">{service.title}</h3>
                <p className="text-gray-600 mt-2">{service.description}</p>
                <p className="font-semibold text-indigo-600 mt-3">{service.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Réalisations</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {portfolioImages.map((image) => (
              <div key={image.id} className="space-y-2">
                <img
              loading="lazy"
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded-xl"
                />

                <p className="font-semibold text-gray-800">{image.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Avis clients</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-600">
              Aucun avis pour l'instant. Les avis apparaissent après une prestation terminée.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{r.author_name}</p>
                    <StarRating value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="text-gray-600 mt-2">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Contacter ce freelance</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Votre nom" aria-label="Votre nom"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input"
            />

            <input
              type="email"
              placeholder="Votre email" aria-label="Votre email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="input"
            />

            {services.length > 0 && (
              <select
                className="input"
                aria-label="Choisir un service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                <option value="">Choisir un service (optionnel)</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} — {service.price}
                  </option>
                ))}
              </select>
            )}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Date souhaitée (optionnel)
              </label>
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                className="input"
              />
            </div>

            <textarea
              placeholder="Décrivez votre besoin" aria-label="Décrivez votre besoin"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-32"
            />

            <button onClick={sendRequest} className="btn-primary">
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioImageUrl, setPortfolioImageUrl] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

     const meRes = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRole(meRes.data.role);

      if (meRes.data.role === "client") {
        setProfileChecked(true);
        return;
      }

      try {
        const profileRes = await API.get("/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMyProfile(profileRes.data);
      } catch (err) {
        setMyProfile(null);
      }

      const statsRes = await API.get("/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(statsRes.data);

      const requestsRes = await API.get("/requests/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(requestsRes.data);
      const servicesRes = await API.get("/services/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

setServices(servicesRes.data);
const portfolioRes = await API.get("/portfolio/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

setPortfolioImages(portfolioRes.data);
      setProfileChecked(true);
    };

    fetchDashboard();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");

    await API.patch(
      `/requests/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const requestsRes = await API.get("/requests/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setRequests(requestsRes.data);

    const statsRes = await API.get("/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats(statsRes.data);
  };

  if (!profileChecked) {
    return <p>Chargement...</p>;
  }

  if (role !== "client" && !stats) {
    return <p>Chargement...</p>;
  }
  if (role === "client") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 md:px-6 py-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Mon espace</h1>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm md:text-base self-start md:self-auto"
            >
              Se déconnecter
            </button>
          </div>

          <div className="card">
            <h2 className="section-title">Mon profil</h2>
            <p className="text-gray-600 mt-2">
              Complétez votre profil pour faciliter vos échanges avec les freelances.
            </p>
            <Link to="/mon-profil-client" className="btn-primary inline-block mt-4">
              Gérer mon profil
            </Link>
          </div>

          <div className="card">
            <h2 className="section-title">Trouver un freelance</h2>
            <p className="text-gray-600 mt-2">
              Parcourez les profils disponibles sur la plateforme.
            </p>
            <Link to="/freelances" className="btn-primary inline-block mt-4">
              Explorer les freelances
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/mes-demandes" className="card text-center hover:shadow-lg transition">
              <p className="font-semibold text-gray-700">Mes demandes</p>
              <p className="text-sm text-indigo-600 mt-2">Voir mes demandes</p>
            </Link>
            <Link to="/favoris" className="card text-center hover:shadow-lg transition">
              <p className="font-semibold text-gray-700">Favoris</p>
              <p className="text-sm text-indigo-600 mt-2">Voir mes favoris</p>
            </Link>
            <Link to="/assistance" className="card text-center hover:shadow-lg transition">
              <p className="font-semibold text-gray-700">Assistance</p>
              <p className="text-sm text-indigo-600 mt-2">Besoin d'aide ?</p>
            </Link>
            <Link to="/conversations" className="card text-center hover:shadow-lg transition">
              <p className="font-semibold text-gray-700">Conversations</p>
              <p className="text-sm text-indigo-600 mt-2">Voir mes messages</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }
const createService = async () => {
  try {
    const token = localStorage.getItem("token");

    if (editingServiceId) {
      await API.put(
        `/services/${editingServiceId}`,
        {
          title: serviceTitle,
          description: serviceDescription,
          price: servicePrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Service modifié !");
      setEditingServiceId(null);
    } else {
      await API.post(
        "/services/create",
        {
          title: serviceTitle,
          description: serviceDescription,
          price: servicePrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Service ajouté !");
    }

    setServiceTitle("");
    setServiceDescription("");
    setServicePrice("");

    const servicesRes = await API.get("/services/me"
      , {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setServices(servicesRes.data);
    
  } catch (err) {
    console.error(err);
    alert("Erreur service");
  }
};
const deleteService = async (serviceId: string) => {
  try {
    const token = localStorage.getItem("token");

    await API.delete(`/services/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setServices(
      services.filter((s) => s.id !== serviceId)
    );

  } catch (err) {
    console.error(err);
    alert("Erreur suppression service");
  }
};
const createPortfolioImage = async () => {
  try {
    const token = localStorage.getItem("token");

    await API.post(
      "/portfolio/create",
      {
        title: portfolioTitle,
        image_url: portfolioImageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const res = await API.get("/portfolio/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPortfolioImages(res.data);

    setPortfolioTitle("");
    setPortfolioImageUrl("");

    alert("Image ajoutée !");
  } catch (err) {
    console.error(err);
    alert("Erreur création image");
  }
};
const deletePortfolioImage = async (imageId: string) => {
  try {
    const token = localStorage.getItem("token");

    await API.delete(`/portfolio/${imageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await API.get("/portfolio/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPortfolioImages(res.data);

  } catch (err) {
    console.error(err);
    alert("Erreur suppression image");
  }
};
  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 md:px-6 py-8 md:py-10">

    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Dashboard
        </h1>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <Link
            to="/conversations"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 md:px-5 rounded-lg transition text-sm md:text-base"
          >
            Mes conversations
          </Link>

          <Link
            to="/assistance"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 md:px-5 rounded-lg transition text-sm md:text-base"
          >
            Assistance
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-5 rounded-lg transition text-sm md:text-base"
          >
            Se déconnecter
          </button>
        </div>
      </div>
      {!myProfile ? (
        <div className="card">
          <h2 className="section-title">
            Créer votre profil freelance
          </h2>

          <p className="text-gray-600 mt-2">
            Vous n’avez pas encore créé votre page publique.
          </p>

          <Link
            to="/mon-profil"
            className="btn-primary inline-block mt-5"
          >
            Créer mon profil
          </Link>
        </div>
      ) : (
        <div className="card flex flex-col md:flex-row items-start gap-6">

          {myProfile.avatar_url && (
            <img
              loading="lazy"
              src={myProfile.avatar_url}
              alt={`Photo de profil de ${myProfile.name}`}
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100"
            />
          )}

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {myProfile.name}
            </h2>

            <p className="text-indigo-600 font-medium text-lg">
              {myProfile.title}
            </p>

            <div className="flex gap-3 pt-2">
              <Link
                to={`/profile/${myProfile.slug}`}
                className="btn-secondary"
              >
                Voir ma page publique
              </Link>

              <Link
                to="/mon-profil"
                className="btn-primary"
              >
                Modifier mon profil
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="card space-y-4">
          <h2 className="section-title">
            Ajouter un service
          </h2>

          <input
            className="input"
            placeholder="Titre du service" aria-label="Titre du service"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Description" aria-label="Description"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />

          <input
            className="input"
            placeholder="Prix" aria-label="Prix"
            value={servicePrice}
            onChange={(e) => setServicePrice(e.target.value)}
          />

          <button
            onClick={createService}
            className="btn-primary"
          >
            {editingServiceId
              ? "Enregistrer les modifications"
              : "Ajouter le service"}
          </button>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">
            Mes réalisations
          </h2>

          <input
            className="input"
            placeholder="Titre" aria-label="Titre"
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
          />

          <ImageUpload
            value={portfolioImageUrl}
            onChange={setPortfolioImageUrl}
            label="Image de la réalisation"
          />

          <button
            onClick={createPortfolioImage}
            className="btn-primary"
          >
            Ajouter l’image
          </button>

          <div className="grid grid-cols-2 gap-4 pt-2">

            {portfolioImages.map((image) => (
              <div
                key={image.id}
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3"
              >
                <img
              loading="lazy"
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-32 object-cover rounded-lg"
                />

                <p className="font-semibold text-gray-800">
                  {image.title}
                </p>

                <button
                  onClick={() => deletePortfolioImage(image.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                >
                  Supprimer
                </button>
              </div>
            ))}

          </div>
        </div>

      </div>

      <div>
        <h2 className="section-title mb-5">
          Mes services
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          {services.map((service) => (
            <div
              key={service.id}
              className="card"
            >
              <h3 className="font-bold text-xl text-gray-900">
                {service.title}
              </h3>

              <p className="text-gray-600 mt-3">
                {service.description}
              </p>

              <p className="font-semibold text-indigo-600 mt-4">
                {service.price}
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => deleteService(service.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Supprimer
                </button>

                <button
                  onClick={() => {
                    setEditingServiceId(service.id);
                    setServiceTitle(service.title);
                    setServiceDescription(service.description);
                    setServicePrice(service.price);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Modifier
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>

      <div>
        <h2 className="section-title mb-5">
          Statistiques
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <div className="card text-center">
            <p className="text-gray-500">Total</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {stats.total_requests}
            </p>
          </div>

          <div className="card text-center">
            <p className="text-gray-500">Nouvelles</p>
            <p className="text-3xl font-bold text-blue-500 mt-2">
              {stats.nouvelle}
            </p>
          </div>

          <div className="card text-center">
            <p className="text-gray-500">En cours</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">
              {stats.en_cours}
            </p>
          </div>

          <div className="card text-center">
            <p className="text-gray-500">Confirmées</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {stats.confirmée}
            </p>
          </div>

          <div className="card text-center">
            <p className="text-gray-500">Refusées</p>
            <p className="text-3xl font-bold text-red-500 mt-2">
              {stats.refusée}
            </p>
          </div>

        </div>
      </div>

      <div>
        <h2 className="section-title mb-5">
          Demandes reçues
        </h2>

        <div className="space-y-5">

          {requests.length === 0 ? (
            <div className="card">
              <p className="text-gray-600">
                Aucune demande reçue pour le moment.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="card"
              >
                <p className="font-bold text-xl">
                  {request.client_name}
                </p>

                <p className="text-gray-500 mt-1">
                  {request.client_email}
                </p>

                <p className="text-gray-700 mt-4">
                  {request.message}
                </p>

                <p className="mt-4 font-semibold text-indigo-600">
                  Statut : {request.status}
                </p>

                <select
                  aria-label="Statut de la demande"
                  value={request.status}
                  onChange={(e) =>
                    updateStatus(request.id, e.target.value)
                  }
                  className="input mt-4"
                >
                  <option value="nouvelle">nouvelle</option>
                  <option value="en cours">en cours</option>
                  <option value="confirmée">confirmée</option>
                  <option value="terminée">terminée</option>
                  <option value="refusée">refusée</option>
                </select>

                {(request.status === "confirmée" || request.status === "terminée") && (
                  request.client_id ? (
                    <Link
                      to="/conversations"
                      className="inline-block mt-4 text-indigo-600 hover:underline font-medium"
                    >
                      💬 Voir la conversation
                    </Link>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500 italic">
                      Ce client n'a pas de compte — contactez-le par email : {request.client_email}
                    </p>
                  )
                )}

                {request.status === "terminée" && (
                  <ReviewBox requestId={request.id} />
                )}
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  </div>
);
}
function MonProfil() {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [availability, setAvailability] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await API.get("/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileId(res.data.id);
        setName(res.data.name || "");
        setTitle(res.data.title || "");
        setCategory(res.data.category || "");
        setBio(res.data.bio || "");
        setCity(res.data.city || "");
        setAvatarUrl(res.data.avatar_url || "");
        setExperienceYears(res.data.experience_years || "");
        setAvailability(res.data.availability || "");
        setStartingPrice(res.data.starting_price || "");
        setLinkedinUrl(res.data.linkedin_url || "");
        setPortfolioUrl(res.data.portfolio_url || "");
        setGithubUrl(res.data.github_url || "");
        setInstagramUrl(res.data.instagram_url || "");
      } catch {
        setProfileId(null);
      }
    };

    fetchMyProfile();
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    const profileData = {
      name,
      title,
      category,
      bio,
      city,
      avatar_url: avatarUrl || "",
      experience_years: experienceYears || "",
      availability: availability || "",
      starting_price: startingPrice || "",
      linkedin_url: linkedinUrl || "",
      portfolio_url: portfolioUrl || "",
      github_url: githubUrl || "",
      instagram_url: instagramUrl || "",
    };

    try {
      if (profileId) {
        await API.put("/profile/me/update", profileData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Profil modifié !");
      } else {
        await API.post("/profile/create", profileData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert("Profil créé !");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erreur sauvegarde profil");
    }
  };

  const deleteProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      await API.delete("/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Profil supprimé !");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erreur suppression profil");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
    <div className="max-w-3xl mx-auto space-y-6">

      <Link to="/dashboard" className="text-indigo-600 hover:underline">
        ← Retour au dashboard
      </Link>

      <div className="card space-y-6">

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {profileId
              ? "Modifier mon profil"
              : "Créer mon profil freelance"}
          </h1>

          <p className="text-gray-600 mt-2">
            Complétez les informations qui apparaîtront sur votre page publique.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="section-title">
            Identité
          </h2>

          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Photo de profil"
          />

          <input
            className="input"
            placeholder="Nom" aria-label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Titre / métier" aria-label="Titre / métier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

        <select
            className="input"
            aria-label="Catégorie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choisir une catégorie</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            className="input"
            list="cities-list-profile"
            placeholder="Ville" aria-label="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <datalist id="cities-list-profile">
            {FRENCH_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="space-y-4">
          <h2 className="section-title">
            Présentation
          </h2>

          <textarea
            className="input min-h-32"
            placeholder="Bio" aria-label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <input
            className="input"
            placeholder="Années d'expérience" aria-label="Années d'expérience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />

          <select
            className="input"
            aria-label="Disponibilité"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Choisir une disponibilité</option>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Tarif de départ" aria-label="Tarif de départ"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h2 className="section-title">
            Liens professionnels
          </h2>

          <input
            className="input"
            placeholder="LinkedIn URL" aria-label="LinkedIn URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="Portfolio URL" aria-label="Portfolio URL"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="GitHub URL" aria-label="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="Instagram URL" aria-label="Instagram URL"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-4 pt-4">

          <button
            className="btn-primary"
            onClick={saveProfile}
          >
            {profileId
              ? "Modifier mon profil"
              : "Créer mon profil"}
          </button>

          {profileId && (
            <button
              onClick={deleteProfile}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
            >
              Supprimer mon profil
            </button>
          )}

        </div>

      </div>
    </div>
  </div>
);
}
function MonProfilClient() {
  const navigate = useNavigate();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await API.get("/client/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileId(res.data.id);
        setName(res.data.name || "");
        setCity(res.data.city || "");
        setAvatarUrl(res.data.avatar_url || "");
      } catch {
        setProfileId(null);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    const data = { name, city, avatar_url: avatarUrl };

    try {
      if (profileId) {
        await API.put("/client/me/update", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Profil modifié !");
      } else {
        await API.post("/client/create", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Profil créé !");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erreur sauvegarde profil");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour au dashboard
        </Link>

        <div className="card space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profileId ? "Modifier mon profil" : "Compléter mon profil"}
            </h1>
            <p className="text-gray-600 mt-2">
              Ces informations apparaîtront lors de vos échanges avec les freelances.
            </p>
          </div>

          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Photo de profil"
          />

          <input
            className="input"
            placeholder="Nom" aria-label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Ville" aria-label="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button className="btn-primary" onClick={saveProfile}>
            {profileId ? "Enregistrer" : "Créer mon profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Conversations() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/conversations/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    };
    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour au dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">Mes conversations</h1>

        {conversations.length === 0 ? (
          <div className="card">
            <p className="text-gray-600">
              Vous n'avez pas encore de conversation. Une conversation s'ouvre
              automatiquement quand une demande est acceptée.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/conversations/${conv.id}`}
                className="card block hover:shadow-lg transition"
              >
                <p className="font-bold text-lg text-gray-900">
                  {conv.other_party_name}
                </p>
                <p className="text-gray-500 mt-1 truncate">
                  {conv.last_message || "Aucun message pour l'instant"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationDetail() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMe = async () => {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyUserId(res.data.id);
    };

    const fetchMessages = async () => {
      const res = await API.get(`/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    };

    fetchMe();
    fetchMessages();
  }, [id]);

  const sendMessage = async () => {
    if (!content.trim()) return;
    const token = localStorage.getItem("token");

    const res = await API.post(
      `/conversations/${id}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages([...messages, res.data]);
    setContent("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/conversations" className="text-indigo-600 hover:underline">
          ← Retour aux conversations
        </Link>

        <div className="card space-y-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucun message pour l'instant. Lancez la conversation !
              </p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.sender_id === myUserId
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <input
              className="input flex-1"
              placeholder="Écrire un message..." aria-label="Écrire un message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="btn-primary">
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/favorites/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data);
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (profileId: string) => {
    const token = localStorage.getItem("token");
    await API.post(
      `/favorites/toggle/${profileId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFavorites(favorites.filter((f) => f.profile_id !== profileId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour au dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">Mes favoris</h1>

        {favorites.length === 0 ? (
          <div className="card">
            <p className="text-gray-600">
              Vous n'avez pas encore de freelance en favori. Ajoutez-en depuis{" "}
              <Link to="/freelances" className="text-indigo-600 hover:underline">
                Découvrir les freelances
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {favorites.map((f) => (
              <div key={f.id} className="card relative">
                <button
                  onClick={() => removeFavorite(f.profile_id)}
                  aria-label={`Retirer ${f.name} des favoris`}
                  className="absolute top-4 right-4 text-xl text-pink-500"
                >
                  <FaHeart />
                </button>

                <Link to={`/profile/${f.slug}`}>
                  {f.avatar_url && (
                    <img
              loading="lazy"
                      src={f.avatar_url}
                      alt={f.name}
                      className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-indigo-100"
                    />
                  )}
                  <h2 className="text-xl font-bold text-gray-900">{f.name}</h2>
                  <p className="text-indigo-600">{f.title}</p>
                  <p className="text-gray-500 mt-1">{f.city}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/requests/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    };
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour au dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">Mes demandes</h1>

        {requests.length === 0 ? (
          <div className="card">
            <p className="text-gray-600">
              Vous n'avez pas encore envoyé de demande.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="card">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lg text-gray-900">
                    {r.freelance_name}
                  </p>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    {r.status}
                  </span>
                </div>

                {r.service_title && (
                  <p className="text-indigo-600 mt-1">{r.service_title}</p>
                )}

                <p className="text-gray-600 mt-3">{r.message}</p>

                {r.desired_date && (
                  <p className="text-gray-500 text-sm mt-2">
                    Date souhaitée : {r.desired_date}
                  </p>
                )}

                {(r.status === "confirmée" || r.status === "terminée") && (
                  <Link
                    to="/conversations"
                    className="inline-block mt-4 text-indigo-600 hover:underline font-medium"
                  >
                    💬 Voir la conversation
                  </Link>
                )}

                {r.status === "terminée" && <ReviewBox requestId={r.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    const res = await API.get("/support/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Merci de remplir le sujet et le message.");
      return;
    }

    const token = localStorage.getItem("token");
    await API.post(
      "/support/create",
      { subject, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubject("");
    setMessage("");
    fetchTickets();
    alert("Ticket envoyé, l'équipe va le traiter.");
  };

  const statusColor = (status: string) => {
    if (status === "ouvert") return "bg-blue-100 text-blue-700";
    if (status === "en cours") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour au dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">Assistance</h1>

        <div className="card space-y-4">
          <h2 className="section-title">Ouvrir un ticket</h2>
          <p className="text-gray-600">
            Une question, un problème ou un signalement ? Décrivez-le ici,
            l'équipe vous répondra.
          </p>

          <input
            className="input"
            placeholder="Sujet" aria-label="Sujet"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            className="input min-h-32"
            placeholder="Décrivez votre problème..." aria-label="Décrivez votre problème..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={submitTicket} className="btn-primary">
            Envoyer le ticket
          </button>
        </div>

        <div>
          <h2 className="section-title mb-4">Mes tickets</h2>

          {tickets.length === 0 ? (
            <div className="card">
              <p className="text-gray-600">Aucun ticket envoyé pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="card">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg text-gray-900">{t.subject}</p>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-3">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function AdminDashboard() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
 const [tab, setTab] = useState<"stats" | "freelances" | "clients" | "tickets">("stats");

  const [freelances, setFreelances] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await API.get("/auth/me", authHeader());
        if (res.data.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setAuthorized(true);
        loadAll();
      } catch {
        navigate("/login");
      } finally {
        setChecked(true);
      }
    };
    checkAdmin();
  }, []);

  const loadAll = async () => {
    const [f, c, t, s] = await Promise.all([
      API.get("/admin/freelances", authHeader()),
      API.get("/admin/clients", authHeader()),
      API.get("/admin/tickets", authHeader()),
      API.get("/admin/stats", authHeader()),
    ]);
    setFreelances(f.data);
    setClients(c.data);
    setTickets(t.data);
    setStats(s.data);
  };

  const toggleSuspend = async (userId: string) => {
    await API.post(`/admin/users/${userId}/toggle-suspend`, {}, authHeader());
    loadAll();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Supprimer définitivement ce compte ?")) return;
    await API.delete(`/admin/users/${userId}`, authHeader());
    loadAll();
  };

  const toggleVerified = async (profileId: string) => {
    await API.post(`/admin/freelances/${profileId}/toggle-verified`, {}, authHeader());
    loadAll();
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await API.patch(`/admin/tickets/${ticketId}/status`, { status }, authHeader());
    loadAll();
  };

  if (!checked) return <p>Chargement...</p>;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm md:text-base self-start md:self-auto"
          >
            Se déconnecter
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          {(["stats", "freelances", "clients", "tickets"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg transition ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {t === "stats" && "Statistiques"}
              {t === "freelances" && "Freelances"}
              {t === "clients" && "Clients"}
               {t === "tickets" && "Tickets"}

              
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-gray-500">Freelances</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_freelances}</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500">Clients</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_clients}</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500">Demandes</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_requests}</p>
            </div>
            <div className="card text-center">
              <p className="text-gray-500">Tickets ouverts</p>
              <p className="text-3xl font-bold text-red-500 mt-2">{stats.open_tickets}</p>
            </div>
          </div>
        )}

        {(tab === "freelances" || tab === "clients") && (
          <div className="space-y-4">
            {(tab === "freelances" ? freelances : clients).map((u) => (
              <div key={u.id} className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    {u.name || "(profil non créé)"}
                    {tab === "freelances" && u.verified && (
                      <span className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                        <FaShieldHalved /> Vérifié
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-sm">{u.email}</p>
                  {u.city && <p className="text-gray-500 text-sm">{u.city}</p>}
                  {u.suspended && (
                    <span className="inline-block mt-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                      Suspendu
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tab === "freelances" && u.profile_id && (
                    <button
                      onClick={() => toggleVerified(u.profile_id)}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition text-sm"
                    >
                      {u.verified ? "Retirer vérification" : "Vérifier"}
                    </button>
                  )}
                  <button
                    onClick={() => toggleSuspend(u.id)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg transition text-sm"
                  >
                    {u.suspended ? "Réactiver" : "Suspendre"}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tickets" && (
          <div className="space-y-4">
            {tickets.length === 0 && (
              <div className="card"><p className="text-gray-600">Aucun ticket.</p></div>
            )}
            {tickets.map((t) => (
              <div key={t.id} className="card">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">{t.subject}</p>
                  <select
                    aria-label="Statut du ticket"
                    value={t.status}
                    onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                    className="input"
                  >
                    <option value="ouvert">ouvert</option>
                    <option value="en cours">en cours</option>
                    <option value="fermé">fermé</option>
                  </select>
                </div>
                <p className="text-gray-500 text-sm mt-1">{t.user_email}</p>
                <p className="text-gray-600 mt-3">{t.message}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
function Footer() {
  return (
    <footer className="text-center py-12">

      <h2 className="text-4xl font-bold text-gray-900">
        Insight Freelance
      </h2>

      <div className="flex justify-center gap-8 text-3xl mt-8 text-gray-700">

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:text-pink-500 transition"
        >
          <FaInstagram />
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:text-blue-500 transition"
        >
          <FaLinkedin />
        </a>

        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="hover:text-black transition"
        >
          <FaTiktok />
        </a>

        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="hover:text-blue-600 transition"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (anciennement Twitter)"
          className="hover:text-gray-900 transition"
        >
          <FaXTwitter />
        </a>

      </div>

      <div className="mt-8 text-gray-500 text-sm space-y-1">
        <p>contact@insightfreelance.com</p>
        <p>+33 6 00 00 00 00</p>
      </div>

      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
        <Link to="/mentions-legales" className="hover:text-indigo-600 hover:underline">
          Mentions légales
        </Link>
        <Link to="/cgu" className="hover:text-indigo-600 hover:underline">
          CGU
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        © 2025 Insight Freelance
      </p>

    </footer>
  );
}
function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem("cookie_consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          Nous utilisons des cookies essentiels au fonctionnement du site (connexion, préférences).
          Aucun cookie publicitaire ou de tracking tiers n'est utilisé.{" "}
          <Link to="/mentions-legales" className="text-indigo-600 hover:underline">
            En savoir plus
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={refuse} className="btn-secondary text-sm">
            Refuser
          </button>
          <button onClick={accept} className="btn-primary text-sm">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

function LegalPageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="text-indigo-600 hover:underline">
          ← Retour à l'accueil
        </Link>
        <div className="card space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MentionsLegales() {
  return (
    <LegalPageLayout title="Mentions légales">
      <p>
        <strong>Éditeur du site :</strong> Insight Freelance, plateforme de mise en
        relation entre freelances et clients.
      </p>
      <p>
        <strong>Contact :</strong> contact@insightfreelance.com
      </p>
      <p>
        <strong>Hébergement :</strong> les informations d'hébergement du site seront
        précisées lors de la mise en production.
      </p>
      <p>
        <strong>Directeur de la publication :</strong> l'équipe fondatrice d'Insight
        Freelance.
      </p>
      <p>
        <strong>Cookies :</strong> le site utilise uniquement des cookies strictement
        nécessaires à son fonctionnement (maintien de la connexion). Aucun cookie
        publicitaire ou de mesure d'audience tiers n'est déposé sans consentement.
      </p>
      <p>
        <strong>Données personnelles :</strong> conformément au RGPD, vous pouvez à
        tout moment consulter, modifier ou supprimer les informations de votre
        profil depuis votre espace personnel, ou en faisant une demande via notre
        page Assistance.
      </p>
    </LegalPageLayout>
  );
}

function CGU() {
  return (
    <LegalPageLayout title="Conditions Générales d'Utilisation">
      <p>
        <strong>1. Objet</strong> — Insight Freelance est une plateforme permettant
        aux freelances de présenter leurs services et aux clients d'entrer en
        relation avec eux, de la découverte du profil jusqu'au suivi de la
        prestation.
      </p>
      <p>
        <strong>2. Comptes utilisateurs</strong> — L'inscription nécessite un email
        valide et un mot de passe. Chaque utilisateur est responsable de la
        confidentialité de ses identifiants et de l'exactitude des informations
        fournies.
      </p>
      <p>
        <strong>3. Mise en relation</strong> — Insight Freelance facilite la mise en
        relation entre clients et freelances mais n'est pas partie prenante des
        prestations convenues entre eux. La messagerie n'est ouverte qu'après
        acceptation d'une demande par le freelance concerné.
      </p>
      <p>
        <strong>4. Modération</strong> — Les comptes ne respectant pas ces
        conditions (contenus abusifs, comportements frauduleux) peuvent être
        suspendus ou supprimés par l'administration.
      </p>
      <p>
        <strong>5. Résiliation</strong> — Chaque utilisateur peut supprimer son
        compte et ses données à tout moment depuis son espace personnel.
      </p>
    </LegalPageLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<CGU />} />
         <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/conversations"
  element={
    <ProtectedRoute>
      <Conversations />
    </ProtectedRoute>
  }
/>
          <Route
  path="/conversations/:id"
  element={
    <ProtectedRoute>
      <ConversationDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/favoris"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>
          <Route
  path="/mes-demandes"
  element={
    <ProtectedRoute>
      <MyRequests />
    </ProtectedRoute>
  }
/>
<Route
  path="/assistance"
  element={
    <ProtectedRoute>
      <Support />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
          <Route path="/freelances" element={<Freelances />} />
          <Route path="/profile/:slug" element={<ProfileDetail />} />
          <Route
  path="/mon-profil"
  element={
    <ProtectedRoute>
      <MonProfil />
    </ProtectedRoute>
  }
/>
       <Route
  path="/mon-profil-client"
  element={
    <ProtectedRoute>
      <MonProfilClient />
    </ProtectedRoute>
  }
/>   
        </Routes>
      </div>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
function Freelances() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      const params: any = {};

      if (search) params.q = search;
      if (category) params.category = category;
      if (city) params.city = city;
      if (availability) params.availability = availability;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;

      const res = await API.get("/profile/", { params });
      setProfiles(res.data);
    };

    fetchProfiles();
  }, [search, category, city, availability, priceMin, priceMax]);
useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await API.get("/favorites/ids", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds(res.data);
      } catch {
        setFavoriteIds([]);
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, profileId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Connectez-vous avec un compte client pour ajouter des favoris.");
      return;
    }

    const res = await API.post(
      `/favorites/toggle/${profileId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.favorited) {
      setFavoriteIds([...favoriteIds, profileId]);
    } else {
      setFavoriteIds(favoriteIds.filter((id) => id !== profileId));
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-8 py-10">

      <div className="max-w-6xl mx-auto">

        <Link
          to="/"
          className="inline-block mb-6 text-indigo-600 hover:underline"
        >
          ← Retour à l’accueil
        </Link>

        <h1 className="text-5xl font-bold text-gray-900">
          Découvrir les freelances
        </h1>

        <p className="text-gray-600 mt-3 mb-10 text-lg">
          Explorez différents profils créatifs et professionnels.
        </p>

        <div className="card mb-8 space-y-4">
          <input
            className="input text-lg"
            placeholder="Rechercher un nom, un métier, une ville, une catégorie..." aria-label="Rechercher un nom, un métier, une ville, une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid md:grid-cols-5 gap-4">
            <select
              className="input"
              aria-label="Filtrer par catégorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              className="input"
              list="cities-list-search"
              placeholder="Ville" aria-label="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <datalist id="cities-list-search">
              {FRENCH_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <select
              className="input"
              aria-label="Filtrer par disponibilité"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">Toutes disponibilités</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <input
              className="input"
              type="number"
              placeholder="Prix min" aria-label="Prix min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />

            <input
              className="input"
              type="number"
              placeholder="Prix max" aria-label="Prix max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {profiles.map((p) => (
            <Link
              to={`/profile/${p.slug}`}
              key={p.id}
              className="card relative hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >

              <button
                onClick={(e) => toggleFavorite(e, p.id)}
                aria-label={favoriteIds.includes(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`}
                className="absolute top-4 right-4 text-xl text-pink-500 hover:scale-110 transition"
              >
                {favoriteIds.includes(p.id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              {p.avatar_url && (
                <img
              loading="lazy"
                  src={p.avatar_url}
                  alt={p.name}
                  className="w-24 h-24 rounded-full object-cover mb-5 border-4 border-indigo-100"
                />
              )}

              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {p.name}
                {p.verified && (
                  <span
                    title="Profil vérifié"
                    className="text-indigo-600 text-sm"
                  >
                    <FaShieldHalved />
                  </span>
                )}
              </h2>

              <p className="text-indigo-600 font-medium mt-1">
                {p.title}
              </p>

              <p className="text-gray-500 mt-1">
                {p.city}
              </p>

              <div className="mt-4 inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                {p.category}
              </div>

            </Link>
          ))}

        </div>

      </div>
<Footer />
    </div>
  );
}