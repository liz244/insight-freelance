"""
Tests automatisés pour Insight Freelance.

Couvre : inscription/connexion, sécurité des endpoints, et les deux règles
métier différenciantes du projet (avis uniquement après prestation
"terminée", messagerie qui ne s'ouvre que si le client a un compte).

Lancer avec :
    cd backend
    python -m pytest tests/ -v
"""
import os
import shutil
import uuid
import pytest
from fastapi.testclient import TestClient

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "test.db")
BACKUP_PATH = DB_PATH + ".backup_before_tests"


@pytest.fixture(scope="session", autouse=True)
def preserve_real_database():
    """
    Sauvegarde la vraie base de données avant les tests et la restaure
    après, pour ne jamais perdre les données réelles (profils, demandes...)
    créées manuellement pendant le développement.
    """
    existed = os.path.exists(DB_PATH)
    if existed:
        shutil.copy(DB_PATH, BACKUP_PATH)

    yield

    if existed:
        shutil.copy(BACKUP_PATH, DB_PATH)
        os.remove(BACKUP_PATH)
    elif os.path.exists(DB_PATH):
        os.remove(DB_PATH)


@pytest.fixture(scope="session")
def client():
    from app.main import app
    return TestClient(app)


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}@test.com"


# ---------------------------------------------------------------------------
# 1. Inscription
# ---------------------------------------------------------------------------

def test_register_creates_account_with_correct_role(client):
    email = unique_email("freelance")
    res = client.post("/auth/register", json={
        "email": email, "password": "motdepasse123", "role": "freelance"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == email
    assert data["role"] == "freelance"


def test_register_rejects_duplicate_email(client):
    email = unique_email("dup")
    client.post("/auth/register", json={"email": email, "password": "test1234", "role": "client"})
    res = client.post("/auth/register", json={"email": email, "password": "test1234", "role": "client"})
    assert res.status_code == 400


# ---------------------------------------------------------------------------
# 2. Connexion
# ---------------------------------------------------------------------------

def test_login_succeeds_with_correct_password(client):
    email = unique_email("login-ok")
    client.post("/auth/register", json={"email": email, "password": "bonmdp123", "role": "client"})
    res = client.post("/auth/login", json={"email": email, "password": "bonmdp123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_rejects_wrong_password(client):
    email = unique_email("login-ko")
    client.post("/auth/register", json={"email": email, "password": "bonmdp123", "role": "client"})
    res = client.post("/auth/login", json={"email": email, "password": "mauvais_mdp"})
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# 3. Sécurité : seul le freelance propriétaire peut modifier le statut
#    de sa propre demande (faille corrigée pendant le développement)
# ---------------------------------------------------------------------------

def test_only_owning_freelance_can_update_request_status(client):
    email_a = unique_email("freelanceA")
    client.post("/auth/register", json={"email": email_a, "password": "test1234", "role": "freelance"})
    token_a = client.post("/auth/login", json={"email": email_a, "password": "test1234"}).json()["access_token"]
    profile = client.post("/profile/create", json={
        "name": "Freelance A", "title": "Dev", "category": "Développement",
        "bio": "bio", "city": "Paris"
    }, headers={"Authorization": f"Bearer {token_a}"}).json()

    email_b = unique_email("freelanceB")
    client.post("/auth/register", json={"email": email_b, "password": "test1234", "role": "freelance"})
    token_b = client.post("/auth/login", json={"email": email_b, "password": "test1234"}).json()["access_token"]

    req = client.post("/requests/create", json={
        "freelancer_slug": profile["slug"],
        "client_name": "Client Test", "client_email": "client@test.com",
        "message": "besoin"
    }).json()

    # Freelance B (intrus) essaie de changer le statut -> doit être refusé
    res_intrus = client.patch(
        f"/requests/{req['id']}/status",
        json={"status": "confirmée"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res_intrus.status_code == 403

    # Freelance A (le vrai propriétaire) peut le faire
    res_owner = client.patch(
        f"/requests/{req['id']}/status",
        json={"status": "confirmée"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res_owner.status_code == 200


# ---------------------------------------------------------------------------
# 4. Règle métier : un avis ne peut être laissé qu'après une prestation
#    marquée "terminée"
# ---------------------------------------------------------------------------

def test_review_rejected_before_request_is_terminee(client):
    email_f = unique_email("freelance-rev")
    client.post("/auth/register", json={"email": email_f, "password": "test1234", "role": "freelance"})
    token_f = client.post("/auth/login", json={"email": email_f, "password": "test1234"}).json()["access_token"]
    profile = client.post("/profile/create", json={
        "name": "Freelance Review", "title": "Dev", "category": "Développement",
        "bio": "bio", "city": "Paris"
    }, headers={"Authorization": f"Bearer {token_f}"}).json()

    email_c = unique_email("client-rev")
    client.post("/auth/register", json={"email": email_c, "password": "test1234", "role": "client"})
    token_c = client.post("/auth/login", json={"email": email_c, "password": "test1234"}).json()["access_token"]

    req = client.post("/requests/create", json={
        "freelancer_slug": profile["slug"],
        "client_name": "Client Review", "client_email": email_c,
        "message": "besoin"
    }, headers={"Authorization": f"Bearer {token_c}"}).json()

    # La demande est encore "nouvelle" -> l'avis doit être refusé
    res = client.post(
        f"/reviews/{req['id']}",
        json={"rating": 5, "comment": "Top"},
        headers={"Authorization": f"Bearer {token_c}"}
    )
    assert res.status_code == 400

    client.patch(f"/requests/{req['id']}/status", json={"status": "confirmée"},
                 headers={"Authorization": f"Bearer {token_f}"})
    client.patch(f"/requests/{req['id']}/status", json={"status": "terminée"},
                 headers={"Authorization": f"Bearer {token_f}"})

    # Maintenant l'avis doit passer
    res2 = client.post(
        f"/reviews/{req['id']}",
        json={"rating": 5, "comment": "Top"},
        headers={"Authorization": f"Bearer {token_c}"}
    )
    assert res2.status_code == 200


# ---------------------------------------------------------------------------
# 5. Règle métier différenciante : la conversation ne se crée QUE si la
#    demande est confirmée ET que le client a un compte
# ---------------------------------------------------------------------------

def test_no_conversation_for_guest_client(client):
    email_f = unique_email("freelance-conv")
    client.post("/auth/register", json={"email": email_f, "password": "test1234", "role": "freelance"})
    token_f = client.post("/auth/login", json={"email": email_f, "password": "test1234"}).json()["access_token"]
    profile = client.post("/profile/create", json={
        "name": "Freelance Conv", "title": "Dev", "category": "Développement",
        "bio": "bio", "city": "Paris"
    }, headers={"Authorization": f"Bearer {token_f}"}).json()

    # Demande envoyée SANS compte client (invité)
    req_guest = client.post("/requests/create", json={
        "freelancer_slug": profile["slug"],
        "client_name": "Invité", "client_email": "invite@test.com",
        "message": "besoin"
    }).json()
    assert req_guest["client_id"] is None

    client.patch(f"/requests/{req_guest['id']}/status", json={"status": "confirmée"},
                 headers={"Authorization": f"Bearer {token_f}"})

    # Aucune conversation ne doit exister pour cette demande d'invité
    convs = client.get("/conversations/", headers={"Authorization": f"Bearer {token_f}"}).json()
    assert not any(c["request_id"] == req_guest["id"] for c in convs)