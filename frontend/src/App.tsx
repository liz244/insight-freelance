import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate,} from "react-router-dom";
import {
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      <nav className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur border-b border-indigo-100">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-700"
        >
          Insight Freelance
        </Link>

        <div className="flex gap-4 items-center">
          <Link
            to="/freelances"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Freelances
          </Link>

          <Link
            to="/login"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Connexion
          </Link>

          <Link
            to="/register"
            className="btn-primary"
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-24">
        <h1 className="text-6xl font-bold max-w-5xl mx-auto text-gray-900 leading-tight">
          Trouvez le freelance idéal pour votre projet
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
          Designers, développeurs, experts beauté et créatifs réunis sur une
          plateforme moderne pour présenter leurs services et recevoir des demandes.
        </p>

        <div className="flex justify-center gap-4 mt-10">
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

      <section className="px-8 py-14">
        <h2 className="section-title text-center mb-10">
          Catégories populaires
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 max-w-6xl mx-auto">

          {[
            "Développement",
            "Design",
            "Beauté",
            "Photo",
            "Marketing",
          ].map((cat) => (
            <div
              key={cat}
              className="card text-center hover:shadow-lg hover:-translate-y-1 transition"
            >
              <p className="font-semibold text-gray-800">
                {cat}
              </p>
            </div>
          ))}

        </div>
      </section>

      <section className="px-8 py-16 bg-white border-y border-indigo-100">

        <h2 className="section-title text-center mb-10">
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
import { useEffect, useState } from "react";
import API from "./api";

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

      console.log(res.data);

      localStorage.setItem("token", res.data.access_token);
alert("Login réussi !");
navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Erreur login");
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl">Login</h1>

      <input
        className="border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}

function Register() {
  const navigate =useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", {
        email,
        password,
      });

      alert("Compte créé ! Connecte-toi maintenant.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Erreur inscription");
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Créer mon compte freelance</h1>

      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2 rounded w-full"
        onClick={handleRegister}
      >
        Créer mon compte
      </button>
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
  const [portfolioImages, setPortfolioImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileRes = await API.get(`/profile/${slug}`);
      setProfile(profileRes.data);

      const servicesRes = await API.get(`/services/${slug}`);
      setServices(servicesRes.data);

      const portfolioRes = await API.get(`/portfolio/${slug}`);
      setPortfolioImages(portfolioRes.data);
    };

    fetchProfile();
  }, [slug]);

  const sendRequest = async () => {
    await API.post("/requests/create", {
      freelancer_slug: slug,
      client_name: clientName,
      client_email: clientEmail,
      message: message,
    });

    alert("Demande envoyée !");
  };

  if (!profile) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        <Link to="/freelances" className="text-indigo-600 hover:underline">
          ← Retour aux freelances
        </Link>

        <div className="card flex flex-col md:flex-row gap-8 items-start">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100"
            />
          )}

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-xl text-indigo-600 font-medium">{profile.title}</p>

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
                <a href={profile.linkedin_url} target="_blank" className="btn-secondary">
                  LinkedIn
                </a>
              )}

              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" className="btn-secondary">
                  Portfolio
                </a>
              )}

              {profile.github_url && (
                <a href={profile.github_url} target="_blank" className="btn-secondary">
                  GitHub
                </a>
              )}

              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" className="btn-secondary">
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
          <h2 className="section-title mb-4">Contacter ce freelance</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Votre nom"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input"
            />

            <input
              type="email"
              placeholder="Votre email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="input"
            />

            <textarea
              placeholder="Votre message"
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

    await API.patch(`/requests/${id}/status`, {
      status,
    });

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

  if (!stats || !profileChecked) {
    return <p>Chargement...</p>;
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
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 py-10">

    <div className="max-w-6xl mx-auto space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-bold text-gray-900">
          Dashboard
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
        >
          Se déconnecter
        </button>
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
              src={myProfile.avatar_url}
              alt="avatar"
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
            placeholder="Titre du service"
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Description"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />

          <input
            className="input"
            placeholder="Prix"
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
            placeholder="Titre"
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
          />

          <input
            className="input"
            placeholder="URL image"
            value={portfolioImageUrl}
            onChange={(e) => setPortfolioImageUrl(e.target.value)}
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
                  value={request.status}
                  onChange={(e) =>
                    updateStatus(request.id, e.target.value)
                  }
                  className="input mt-4"
                >
                  <option value="nouvelle">nouvelle</option>
                  <option value="en cours">en cours</option>
                  <option value="confirmée">confirmée</option>
                  <option value="refusée">refusée</option>
                </select>
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

          <input
            className="input"
            placeholder="URL avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Titre / métier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="input"
            placeholder="Catégorie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="input"
            placeholder="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h2 className="section-title">
            Présentation
          </h2>

          <textarea
            className="input min-h-32"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <input
            className="input"
            placeholder="Années d'expérience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />

          <input
            className="input"
            placeholder="Disponibilité"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />

          <input
            className="input"
            placeholder="Tarif de départ"
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
            placeholder="LinkedIn URL"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="Portfolio URL"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <input
            className="input"
            placeholder="Instagram URL"
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
          className="hover:text-pink-500 transition"
        >
          <FaInstagram />
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          className="hover:text-blue-500 transition"
        >
          <FaLinkedin />
        </a>

        <a
          href="https://tiktok.com"
          target="_blank"
          className="hover:text-black transition"
        >
          <FaTiktok />
        </a>

        <a
          href="https://facebook.com"
          target="_blank"
          className="hover:text-blue-600 transition"
        >
          <FaFacebookF />
        </a>

        <a
          href="https://x.com"
          target="_blank"
          className="hover:text-gray-900 transition"
        >
          <FaXTwitter />
        </a>

      </div>

      <div className="mt-8 text-gray-500 text-sm space-y-1">
        <p>contact@insightfreelance.com</p>
        <p>+33 6 00 00 00 00</p>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        © 2025 Insight Freelance
      </p>

    </footer>
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
         <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
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
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

function Freelances() {
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const res = await API.get("/profile/");
      setProfiles(res.data);
    };

    fetchProfiles();
  }, []);

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

        <div className="grid md:grid-cols-3 gap-6">

          {profiles.map((p) => (
            <Link
              to={`/profile/${p.slug}`}
              key={p.id}
              className="card hover:shadow-xl hover:-translate-y-1 transition duration-300"
            >

              {p.avatar_url && (
                <img
                  src={p.avatar_url}
                  alt={p.name}
                  className="w-24 h-24 rounded-full object-cover mb-5 border-4 border-indigo-100"
                />
              )}

              <h2 className="text-2xl font-bold text-gray-900">
                {p.name}
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