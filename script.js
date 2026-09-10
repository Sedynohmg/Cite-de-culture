const authModal = document.getElementById("authModal");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const switchAuth = document.getElementById("switchAuth");

function showAuth(){
    if(!authModal){
        return;
    }
    authModal.classList.remove("hidden");
    authModal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
}

function hideAuth(){
    if(!authModal){
        return;
    }
    authModal.classList.add("hidden");
    authModal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
}

// INSCRIPTION

if(!registerForm){
    registerForm.addEventListener("submit", async (event)=>{
        event.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const phone = document.getElementById("registerPhone").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if(!name || !email ||!password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        const { data, error} = await supbaseClient.auth.signUp({
            email: email,
            password : password,
            options:{
                data:{
                    name:name,
                    phone:phone
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

    })
}

// =======CONNEXION===============

if(loginForm){
    loginForm.addEventListener("submit",async(event)=>{
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const {data,error}=await supbaseClient.auth.singInWithPassword({
            email:email,
            password:password
        });
        if(error){
            console.error(error);
            alert("Connexion impossible:" + error.message);
            return;
        }
        hideAuth();
        await loadCurrentUser();
    });
}


if(switchAuth){
    switchAuth.addEventListener("click",()=>{
        const isRegister = !registerForm.classList.contains("hidden");
        if(isRegister){
            registerForm.classList.add("hidden");
            loginForm.classList.remove("hidden");
            document.getElementById("authTitle").textContent = "Connexion";
            document.getElementById("authDescription").textContent = "Connectez-vous pour accéder à vos activités.";
            switchAuth.textContent = "Je veux créer un compte";
        } else {
            loginForm.classList.add("hidden");
            registerForm.classList.remove("hidden");
            document.getElementById("authTitle").textContent = "Créer votre compte";
            document.getElementById("authDescription").textContent = "Créez votre compte pour accéder à CiteActive.";
            switchAuth.textContent = "J'ai déjà un compte";
        }
    })
}

// =====UTILISATEUR CONNECTÉ======
let currentUser = null;

async function loadCurrentUser(){
    const{data,error} = await supbaseClient.auth.getUser();
    if(error || !data.user){
        currentUser = null;
        showAuth();
        return null;
    }
    currentUser = data.user;
    hideAuth();
    return currentUser;
}

document.addEventListener("DOMContentLoaded",async()=>{
    await loadCurrentUser();
})



// ===== MENU MOBILE ==========

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });
}

// Fermer le menu après avoir cliqué sur un lien
document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });
});

// ===== FILTRE DES ACTIVITÉS ==========

function filterActivites(category, event) {
    const cards = document.querySelectorAll(".activity-card");
    cards.forEach(card => {
        const cardCategory = card.dataset.category;

        if (category === "all" || cardCategory === category) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
    // Mise à jour des boutons
    document.querySelectorAll(".filter-btn").forEach(button => {

        button.classList.remove(
            "bg-[#005383]",
            "text-white"
        );
        button.classList.add("bg-slate-100");

    });

    // Activer le bouton sélectionné

    if (event) {
        event.target.classList.remove("bg-slate-100");

        event.target.classList.add(
            "bg-[#005383]",
            "text-white"
        );
    }
}


// ===== AGENDA ==========

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let selectedDate = null;
let selectedTime = null;

// ===== CRÉNEAUX DISPONIBLES ==========
const timeSlots = [
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00"
];


// ===== NOMS DES MOIS ==========

const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
];


// ===== OUVRIR LA RÉSERVATION ==========

function openReservation(activity = "") {
    const modal = document.getElementById("reservationModal");
    if (!modal) {
        console.error("Le modal reservationModal est introuvable.");
        return;
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
    // Sélectionner l'activité
    if (activity !== "") {
        const activityInput = document.getElementById("activity");
        if (activityInput) {
            activityInput.value = activity;
        }

    }

    // Réinitialiser les choix

    selectedDate = null;
    selectedTime = null;

    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    if (dateInput) {
        dateInput.value = "";
    }

    if (timeInput) {
        timeInput.value = "";
    }
        resetSubmitButton();
        renderCalendar();
        renderTimeSlots();
}


// ===== FERMER LA RÉSERVATION ==========

function closeReservation() {
    const modal = document.getElementById("reservationModal");
    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    document.body.classList.remove("overflow-hidden");
}

// ===== FERMER AVEC LA TOUCHE ESCAPE ==========

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeReservation();
    }

});


// ===== BOUTONS DU CALENDRIER ==========

function initCalendarButton() {

    const previousButton = document.getElementById("previousMonthButton");
    const nextButton = document.getElementById("nextMonthButton");

    if (previousButton) {
        previousButton.addEventListener("click", previousMonth);
    }

    if (nextButton) {
        nextButton.addEventListener("click", nextMonth);
    }

}
initCalendarButton();

// ===== MOIS PRÉCÉDENT ==========

function previousMonth() {

    currentMonth--;

    if (currentMonth < 0) {

        currentMonth = 11;
        currentYear--;

    }

    renderCalendar();
}


// ===== MOIS SUIVANT ==========

function nextMonth() {

    currentMonth++;

    if (currentMonth > 11) {

        currentMonth = 0;
        currentYear++;

    }

    renderCalendar();
}
// ===== OBTENIR LES RÉSERVATIONS ==========
function getReservations() {
    try {
        return JSON.parse(
            localStorage.getItem("cite_reservations")
        ) || [];

    } catch (error) {
        console.log(
            "Erreur lecture réservation :",
            error
        );
        return [];
    }

}


// ===== SAUVEGARDER LES RÉSERVATIONS ==========

function saveReservation(reservations) {

    localStorage.setItem(
        "cite_reservations",
        JSON.stringify(reservations)
    );

}


// ===== FORMATER UNE DATE ==========

function formDate(dateString) {
    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "fr-FR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}

function creatDateString(year, month, day){
    return(
        year + "-" + String(month+1).padStart(2, "0")+"-"+String(day).padStart(2,"0")
    );
}

// =====RENDRE LE CALENDRIER========
function renderCalendar(){
    const calendar=document.getElementById("calendar");
    const title = document.getElementById("calendarTitle");
    if(!calendar || !title){
        return;
    }
    calendar.innerHTML = "";
    title.textContent=`${monthNames[currentMonth]} ${currentYear}`;
    const firstDay = new Date(currentYear, currentMonth, 1)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let startDay = firstDay.getDay() - 1;
    if(startDay === -1){
        startDay = 6;
    }
    for(let i=0;i<startDay;i++){
        const emptyCell = document.createElement("div");
        emptyCell.className ="calendar-day border-b border-r border-slate-100";
        calendar.appendChild(emptyCell);
    }
    const today = new Date();
    const todayString = creatDateString(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );



    const activityInput = document.getElementById("activity");
    const activity = activityInput? activityInput.value:"";
    const reservations = getReservations();

    for(let day = 1; day<= daysInMonth; day++){
        const dateString = creatDateString(currentYear, currentMonth,day);
        const button = document.createElement("button");
        button.type = "button";
        button.className ="button";
        button.className = "calendar-day relative border-b border-r border-slate-100 flex items-center justify-center font-semibold hover:bg-sky-500";
        button.textContent = day;

        if(dateString === selectedDate){
            button.classList.add("bg-sky-500");
        }
        // ========COMPTER LES RESERVATIONS=========
        const reservationsForDay = reservations.filter((reservation)=>{
            return(
                reservation.date === dateString && (!activity || reservation.activity === activity)
            );
        });
    //    ========= JOUR COMPLET===========
    if(reservationsForDay.length >=timeSlots.length){
        button.classList.add("full");
    }
    // ============PETIT POINT SI RESERVE======
    if(reservationsForDay.length > 0 && reservationsForDay.length < timeSlots.length){
        const dot = document.createElement("span");
        dot.className = "absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full";
        button.appendChild(dot)
    }
    button.addEventListener("click",()=>{
        selectDate(dateString);
    });
    calendar.appendChild(button);
    } 
}

function selectDate(dateString) {
  selectedDate = dateString;
  selectedTime = null;
  document.getElementById("date").value = dateString;

  document.getElementById("time").value = "";

  resetSubmitButton();

  renderCalendar();

  renderTimeSlots();
}

// ==========AFFICHER LES CRENEAUX=========
function renderTimeSlots(){
    const container = document.getElementById("timeSlots");
    const selectedDateText = document.getElementById("selectedDateText");
    if(!container){
        return;
    }
    container.innerHTML = "";

    if(!selectedDate){
        selectedDateText.textContent = "Sélectionnez une date dans le calendrier.";
        container.innerHTML = `
        <div class="sm:col-span-2 p-5 rounded-xl bg-slate-50 text-center">
            <div class="text-slate-400 mb-2">
                <i class="bi bi-calendar-day text-2xl"></i>
            </div>
            <p class= "text-sm text-slate-400">
                Sélectionnez une date pour voir les créneaux.
            </p>
        </div>
        `
        return;
    }
    selectedDateText.textContent = formDate(selectedDate);
    const activity = document.getElementById("activity").value;
     if (!activity) {
    container.innerHTML = `
            <div class="sm:col-span-2 p-5 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                <p class="text-sm text-yellow-700">
                     Sélectionnez une activité pour voir les disponibilités.
                </p>

            </div>
        `;
        return;
    }
// Réservations
 const reservations = getReservations();
timeSlots.forEach((time)=>{
    const existingReservation = reservations.find((reservation)=>{
        return(
            reservation.date === selectedDate &&
            reservation.time === time &&
            reservation.activity === activity
        );
    });
    const button = document.createElement("button");
    button.type = "button";
    if(existingReservation){
        button.disabled = true;
        button.className =
        "flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 cursor-not-allowed";
        button.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-bold">
                        ${time}
                    </span>
                </div>
                <span class="flex items-center gap-2 text-sm">
                    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                    Réservé
                </span>
            `;   
    }
    else{
        button.className =
        "time-slot flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-500 transition";

      // Si sélectionné

      if (selectedTime === time) {
        button.classList.add("selected");
      }

      button.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="font-bold">
                        ${time}
                    </span>
                </div>
                <span class="flex items-center gap-2 text-sm">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Disponible
                </span>

            `;

      button.addEventListener("click", () => {
        selectTime(time);
      });
    }
    container.appendChild(button)
    
});
}

function selectTime(time) {
  selectedTime = time;
  document.getElementById("time").value = time;

  // Activer bouton réservation

  const submitButton = document.getElementById("submitReservation");

  submitButton.disabled = false;

  submitButton.className =
    "w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-xl font-bold transition";

  submitButton.textContent = `Réserver à ${time}`;

  // Rafraîchir les créneaux

  renderTimeSlots();
}
function resetSubmitButton() {
  const submitButton = document.getElementById("submitReservation");

  if (!submitButton) {
    return;
  }

  submitButton.disabled = true;

  submitButton.className =
    "w-full bg-slate-300 text-slate-500 py-3.5 rounded-xl font-bold cursor-not-allowed";

  submitButton.textContent = "Sélectionnez un créneau";
}


function updateAgenda() {
  selectedDate = null;

  selectedTime = null;

  document.getElementById("date").value = "";

  document.getElementById("time").value = "";

  resetSubmitButton();

  renderCalendar();

  renderTimeSlots();
}

//CLIENT ACTUEL

function getCurrentClient(){
    return localStorage.getItem("cite_current_client")|| "";
}

function setCurrentClient(name){
    localStorage.setItem("cite_current_client",name.trim());
}

function openActivities(){
    const modal = document.getElementById("activitiesModal");
    if(!modal){
        return;
    }
    const currentClient = getCurrentClient();
    if(!currentClient){
        alert("Aucun client n'est encore enregistré. Faites d'abord une réservation.");
        return;
    }
    const clientNameElement = document.getElementById("currentClientName");
    if(clientNameElement){
        clientNameElement.textContent = currentClient;
    }
    renderActivities(currentClient);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden")
}
//FERMER LES ACTIVIT0ÉS

function closeActivities(){
    const modal = document.getElementById("activitiesModal");
    if(!modal){
        return;
    }
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
}

//AFFICHER LES ACT DU CLIENT
function renderActivities(clientName){
    const activitiesList = document.getElementById("activitiesList");
    const noActivities = document.getElementById("noActivities");
    if(!activitiesList || !noActivities){
        return;
    }
    activitiesList.innerHTML = "";
    const reservations= getReservations();
    const clientReservations = reservations.filter((reservation)=>{
        return(
            reservation.name && reservation.name.trim().toLowerCase() === clientName.trim().toLowerCase()
        );
    });
    if(clientReservations.length === 0){
        noActivities.classList.remove("hidden");
        return;
    }
    noActivities.classList.add("hidden");
    clientReservations.forEach((reservation)=>{
        if(!reservation.id){
            reservation.id = `${reservation.name}-${reservation.activity}-${reservation.date}
            -${reservation.time}`.replace(/\s+/g,"-").toLocaleLowerCase();
        }

        const checkedKey = `activity_checked_${reservation.id}`;
        const isChecked = localStorage.getItem(checkedKey) === "true";
        const item = document.createElement("label");
        item.className = "flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hove:border-sky-300 hover:bg-sky-50/50 transition";
        item.innerHTML = ` 
        <input type="checkbox" class="activity-checkbox w-5 h-5 accent-sky-600 cursor-pointer shrink-0"
            data-reservation-id = "${escapeHTML(reservation.id)}" ${isChecked? "checked":""}>
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800 truncate">
                ${escapeHTML(reservation.activity)}
            </h3>
            <p class="text-sm text-slate-500 mt-1">
                <i class="bi bi-calendar3 mr-1"></i>
                ${escapeHTML(formDate(reservation.date))}
                <span class="mx-1">•</span>
                <i class="bi bi-clock mr-1"></i>
                ${escapeHTML(reservation.time)}
            </p>
        </div>
        <span class="activity-status text-xs font-bold px-3 py-1.5 rounded-full ${isChecked?"bg-green-500 text-green-700":"bg-slate-100 text-slate-500"}">
            ${isChecked ? "En cours":"Réservée"}
        </span>  
            `;
        const checkbox = item.querySelector(".activity-checkbox");
        const status = item.querySelector(".activity-status");
        checkbox.addEventListener("change",()=>{
            localStorage.setItem(checkedKey,checkbox.checked?"true":"false");
            if(checkbox.checked){
                status.textContent = "En cours";
                status.className= "activity-status text-xs font-bold px-3 py-1.5 rounded-full bg-green text-green-700;"
            } else {
                status.textContent = "Réservée";
                status.className = "activity-status text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500";
            }
        });

        activitiesList.appendChild(item)
    });
    
    // saveReservation(reservations)

}

function escapeHTML(value){
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;")
}



// ===== FORMULAIRE DE RÉSERVATION ==========

const reservationForm =  document.getElementById("reservationForm");

if (reservationForm) {
    reservationForm.addEventListener( "submit",  (event) => { event.preventDefault();
            // Récupérer les valeurs AU MOMENT de la soumission
            const name = document.getElementById("name").value.trim();

            const activity = document.getElementById("activity").value.trim();

            const date =document.getElementById("date").value.trim();

            const time = document.getElementById("time").value.trim();

            // Vérifier les champs

            if (!name || !activity || !date || !time) {

                alert("Veuillez remplir tous les champs et sélectionner un créneau.");
                return;
            }
            // Récupérer les réservations
            const reservations = getReservations();
            // Vérifier si le créneau est déjà réservé
            const alreadyReserved =
                reservations.some((reservation) => {
                    return (
                        reservation.activity === activity &&
                        reservation.date === date &&
                        reservation.time === time
                    );

                });

            if (alreadyReserved) {
                alert("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
                return;
            }

            // Créer la réservation
            const newReservation = {
                name: name,
                activity: activity,
                date: date,
                time: time
            };
            // Ajouter la réservation
            reservations.push(newReservation);
            saveReservation(reservations);
            setCurrentClient(name)
            alert(
                "Votre réservation a été enregistrée avec succès !"
            );

            // Réinitialiser le formulaire
            reservationForm.reset();
            selectedDate = null;
            selectedTime = null;
            closeReservation();

        }
    );

}