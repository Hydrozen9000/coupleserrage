// Section résistante As (mm²) de chaque vis métrique à pas normal
const diametres = {
  3: 5.03, 4: 8.78, 5: 14.2, 6: 20.1, 8: 36.6, 10: 58,
  12: 84.3, 14: 115, 16: 157, 18: 192, 20: 245, 24: 353, 30: 561
};

// Limite d'élasticité Rp0,2 (MPa) de chaque classe de qualité
const classes = {
  "4.6": 240, "5.8": 420, "8.8": 640, "10.9": 940, "12.9": 1100
};

const selectDiametre = document.getElementById("diametre");
const selectClasse = document.getElementById("classe");

// Remplit les listes déroulantes
for (const d in diametres) {
  selectDiametre.add(new Option("M" + d, d));
}
for (const c in classes) {
  selectClasse.add(new Option(c, c));
}
selectDiametre.value = "8";
selectClasse.value = "8.8";

function calculer() {
  const d = Number(selectDiametre.value);       // diamètre en mm
  const rp = classes[selectClasse.value];       // MPa = N/mm²
  const k = Number(document.getElementById("frottement").value);
  const as = diametres[d];

  // Force de serrage (N) = 75 % de la limite d'élasticité × section
  const force = 0.75 * rp * as;

  // Couple (N·m) = K × d(mm) × F(N) ÷ 1000
  const couple = (k * d * force) / 1000;

  document.getElementById("couple").textContent = couple.toFixed(1).replace(".", ",");
  document.getElementById("detail").textContent =
    "Force de serrage obtenue : " + Math.round(force) + " N";
  document.getElementById("resultat").hidden = false;
}

document.getElementById("calculer").addEventListener("click", calculer);
