// Chaque vis est décrite par : [nom affiché, diamètre en mm, pas en mm]
// Pour le pouce, le pas = 25,4 ÷ nombre de filets par pouce.
const pouce = (nom, diametreEnPouces, filetsParPouce) =>
  [nom, diametreEnPouces * 25.4, 25.4 / filetsParPouce];

const metrique = (d, pas) => ["M" + d + " × " + String(pas).replace(".", ","), d, pas];

const familles = {
  "metrique-normal": {
    coefficient: 0.9382, // sert à calculer la section résistante
    classes: "metrique",
    vis: [
      metrique(3, 0.5), metrique(4, 0.7), metrique(5, 0.8), metrique(6, 1),
      metrique(8, 1.25), metrique(10, 1.5), metrique(12, 1.75), metrique(14, 2),
      metrique(16, 2), metrique(18, 2.5), metrique(20, 2.5), metrique(24, 3),
      metrique(30, 3.5)
    ]
  },
  "metrique-fin": {
    coefficient: 0.9382,
    classes: "metrique",
    vis: [
      metrique(6, 0.75), metrique(8, 1), metrique(10, 1), metrique(10, 1.25),
      metrique(12, 1.25), metrique(12, 1.5), metrique(14, 1.5), metrique(16, 1.5),
      metrique(18, 1.5), metrique(20, 1.5), metrique(24, 2), metrique(30, 2)
    ]
  },
  "unc": {
    coefficient: 0.9743,
    classes: "sae",
    vis: [
      pouce('1/4" - 20 UNC', 1 / 4, 20), pouce('5/16" - 18 UNC', 5 / 16, 18),
      pouce('3/8" - 16 UNC', 3 / 8, 16), pouce('7/16" - 14 UNC', 7 / 16, 14),
      pouce('1/2" - 13 UNC', 1 / 2, 13), pouce('9/16" - 12 UNC', 9 / 16, 12),
      pouce('5/8" - 11 UNC', 5 / 8, 11), pouce('3/4" - 10 UNC', 3 / 4, 10),
      pouce('7/8" - 9 UNC', 7 / 8, 9), pouce('1" - 8 UNC', 1, 8)
    ]
  },
  "unf": {
    coefficient: 0.9743,
    classes: "sae",
    vis: [
      pouce('1/4" - 28 UNF', 1 / 4, 28), pouce('5/16" - 24 UNF', 5 / 16, 24),
      pouce('3/8" - 24 UNF', 3 / 8, 24), pouce('7/16" - 20 UNF', 7 / 16, 20),
      pouce('1/2" - 20 UNF', 1 / 2, 20), pouce('9/16" - 18 UNF', 9 / 16, 18),
      pouce('5/8" - 18 UNF', 5 / 8, 18), pouce('3/4" - 16 UNF', 3 / 4, 16),
      pouce('7/8" - 14 UNF', 7 / 8, 14), pouce('1" - 12 UNF', 1, 12)
    ]
  }
};

// Limite d'élasticité (MPa) de chaque classe de qualité
const listesDeClasses = {
  metrique: {
    "4.6": () => 240, "5.8": () => 420, "8.8": () => 640,
    "10.9": () => 940, "12.9": () => 1100
  },
  // Vis en pouce (SAE) : la classe 2 est moins résistante au-dessus de 3/4"
  sae: {
    "SAE grade 2": (d) => (d <= 19.05 ? 379 : 228),
    "SAE grade 5": () => 585,
    "SAE grade 8": () => 830
  }
};

const selectFamille = document.getElementById("famille");
const selectDiametre = document.getElementById("diametre");
const selectClasse = document.getElementById("classe");

// Remplit les listes de diamètres et de classes selon le type de filetage
function remplirListes() {
  const famille = familles[selectFamille.value];

  selectDiametre.innerHTML = "";
  famille.vis.forEach((vis, i) => selectDiametre.add(new Option(vis[0], i)));

  selectClasse.innerHTML = "";
  Object.keys(listesDeClasses[famille.classes]).forEach((nom) =>
    selectClasse.add(new Option(nom, nom))
  );
}

function calculer() {
  const famille = familles[selectFamille.value];
  const [, d, pas] = famille.vis[Number(selectDiametre.value)]; // mm
  const rp = listesDeClasses[famille.classes][selectClasse.value](d); // MPa = N/mm²
  const k = Number(document.getElementById("frottement").value);

  // Section résistante (mm²) : section du "diamètre moyen" du filetage
  const diametreMoyen = d - famille.coefficient * pas;
  const as = (Math.PI / 4) * diametreMoyen ** 2;

  // Force de serrage (N) = 75 % de la limite d'élasticité × section
  const force = 0.75 * rp * as;

  // Couple (N·m) = K × d(mm) × F(N) ÷ 1000, puis 1 daN·m = 10 N·m
  const coupleNm = (k * d * force) / 1000;
  const coupleDan = coupleNm / 10;

  const virgule = (nombre, decimales) => nombre.toFixed(decimales).replace(".", ",");
  document.getElementById("couple-dan").textContent = virgule(coupleDan, 2);
  document.getElementById("couple-nm").textContent = virgule(coupleNm, 1);
  document.getElementById("detail").textContent =
    "Section " + virgule(as, 1) + " mm² · limite d'élasticité " + rp +
    " MPa · force de serrage " + Math.round(force) + " N";
  document.getElementById("resultat").hidden = false;
}

selectFamille.addEventListener("change", remplirListes);
document.getElementById("calculer").addEventListener("click", calculer);

remplirListes();
