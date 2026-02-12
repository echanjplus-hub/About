import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyB1VTPakleoggsbLdpm_HS7nSb3A7A99Qw",
    authDomain: "echanj-plus-778cd.firebaseapp.com",
    databaseURL: "https://echanj-plus-778cd-default-rtdb.firebaseio.com",
    projectId: "echanj-plus-778cd",
    storageBucket: "echanj-plus-778cd.firebasestorage.app",
    messagingSenderId: "111144762929",
    appId: "1:111144762929:web:e64ce9a6da65781c289f10"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let uID = null;
let currentBalance = 0;

// 2. Koute Balans lan
onAuthStateChanged(auth, (user) => {
    if (user) {
        uID = user.uid;
        onValue(ref(db, `users/${uID}/balance`), (snapshot) => {
            currentBalance = snapshot.val() || 0;
            document.getElementById('user-balance').innerText = currentBalance.toFixed(2);
        });
    }
});

// 3. UI: Montre/Kache seksyon
window.toggleBox = (id) => {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
};

// 4. Kalkil an tan reyèl
document.getElementById('qty-digi').oninput = (e) => {
    let v = parseFloat(e.target.value) || 0;
    document.getElementById('calc-digi').innerText = `W ap resevwa: ${(v - (v*0.165)).toFixed(2)} G`;
};

document.getElementById('qty-nat').oninput = (e) => {
    let v = parseFloat(e.target.value) || 0;
    document.getElementById('calc-nat').innerText = `W ap resevwa: ${(v - (v*0.165)).toFixed(2)} G`;
};

// 5. LOJIK ECHANJ (+)
window.processEchanj = async (type) => {
    let inputId = type === 'digicel' ? 'qty-digi' : 'qty-nat';
    let qty = parseFloat(document.getElementById(inputId).value);

    if(!qty || qty <= 0) return alert("Antre yon kantite valid!");

    let net = qty - (qty * 0.165);

    try {
        // A. Mizajou Balans
        await update(ref(db, `users/${uID}`), { balance: currentBalance + net });

        // B. Ouvri Dialer Telefòn
        let telCode = type === 'digicel' 
            ? `tel:*128*50947111123*${qty}%23` 
            : `tel:*123*88888888*32160708*${qty}%23`;
        
        window.location.href = telCode;

        // C. Netwaye
        document.getElementById(inputId).value = "";
        alert("Balans ou mete ajou!");
    } catch (e) {
        alert("Erè nan koneksyon.");
    }
};

// 6. LOJIK RETRÈ (-)
window.processRetre = async () => {
    let amt = parseFloat(document.getElementById('retre-amt').value);
    let nom = document.getElementById('retre-nom').value;
    let met = document.querySelector('input[name="m"]:checked').value;

    if(!amt || !nom) return alert("Tanpri ranpli tout chan yo.");
    if(amt > currentBalance) return alert("Ou pa gen ase kòb!");

    try {
        // A. Sove nan Firebase pou verifikasyon
        await push(ref(db, 'withdrawals'), {
            uid: uID, 
            name: nom, 
            amount: amt, 
            method: met, 
            time: new Date().toISOString()
        });

        // B. Soti nan balans
        await update(ref(db, `users/${uID}`), { balance: currentBalance - amt });

        // C. WhatsApp
        let msg = `💸 *RETRÈ ECHANJ PLUS*%0A👤 Non: ${nom}%0A💰 Kantite: ${amt}G%0A🏦 Metòd: ${met}`;
        window.location.href = `https://wa.me/50947111123?text=${msg}`;
        
    } catch (e) {
        alert("Echèk retrè.");
    }
};
                
