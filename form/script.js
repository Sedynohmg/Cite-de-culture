// =====================================================
// AUTHENTIFICATION
// =====================================================

const authModal = document.getElementById("authModal");

const registerForm =
    document.getElementById("registerForm");

const loginForm =
    document.getElementById("loginForm");

const switchAuth =
    document.getElementById("switchAuth");


// =====================================================
// AFFICHER / CACHER AUTH
// =====================================================

function showAuth() {

    if (!authModal) {
        return;
    }

    authModal.classList.remove("hidden");
    authModal.classList.add("flex");

    document.body.classList.add("overflow-hidden");
}


function hideAuth() {

    if (!authModal) {
        return;
    }

    authModal.classList.add("hidden");
    authModal.classList.remove("flex");

    document.body.classList.remove("overflow-hidden");
}


// =====================================================
// INSCRIPTION
// =====================================================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("registerName").value.trim();

        const phone =
            document.getElementById("registerPhone").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;


        if (!name || !phone || !email || !password) {

            alert("Veuillez remplir tous les champs.");

            return;
        }


        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    name: name,
                    phone: phone
                }

            }

        });


        if (error) {

            console.error(error);

            alert(
                "Erreur lors de la création du compte : " +
                error.message
            );

            return;
        }


        if (!data.user) {

            alert("Impossible de créer le compte.");

            return;
        }


        // Si Supabase demande la confirmation email,
        // la session peut être null.
        if (!data.session) {

            alert(
                "Votre compte a été créé. Vérifiez votre email pour confirmer votre compte."
            );

            return;
        }


        // Créer le profil
        const {
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .insert({

                id: data.user.id,

                name: name,

                phone: phone

            });


        if (profileError) {

            console.error(profileError);

            alert(
                "Compte créé, mais erreur lors de la création du profil."
            );

            return;
        }


        hideAuth();

        alert(`Bienvenue ${name} !`);

    });

}



// =====================================================
// CONNEXION
// =====================================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {

            console.error(error);

            alert(
                "Connexion impossible : " +
                error.message
            );

            return;
        }


        hideAuth();

        await loadCurrentUser();

    });

}



if (switchAuth) {

    switchAuth.addEventListener("click", () => {

        const isRegister =
            !registerForm.classList.contains("hidden");


        if (isRegister) {

            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");

            document.getElementById("authTitle")
                .textContent = "Connexion";

            document.getElementById("authDescription")
                .textContent =
                "Connectez-vous pour accéder à vos activités.";

            switchAuth.textContent =
                "Je veux créer un compte";

        } else {

            loginForm.classList.add("hidden");
            registerForm.classList.remove("hidden");

            document.getElementById("authTitle")
                .textContent =
                "Créer votre compte";

            document.getElementById("authDescription")
                .textContent =
                "Créez votre compte pour accéder à CiteActive.";

            switchAuth.textContent =
                "J'ai déjà un compte";

        }

    });

}



// =====================================================
// UTILISATEUR CONNECTÉ
// =====================================================

let currentUser = null;


async function loadCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (error || !data.user) {

        currentUser = null;

        showAuth();

        return null;
    }


    currentUser = data.user;

    hideAuth();

    return currentUser;
}

document.addEventListener("DOMContentLoaded", async () => {

    await loadCurrentUser();

});