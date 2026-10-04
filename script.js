// ---------- Les données ----------

// Vis métriques : diamètre (mm) → pas normal et pas fins (mm)
const metrique = {
  3: { normal: 0.5, fins: [] },
  4: { normal: 0.7, fins: [] },
  5: { normal: 0.8, fins: [] },
  6: { normal: 1, fins: [0.75] },
  8: { normal: 1.25, fins: [1] },
  10: { normal: 1.5, fins: [1.25, 1] },
  12: { normal: 1.75, fins: [1.5, 1.25] },
  14: { normal: 2, fins: [1.5] },
  16: { normal: 2, fins: [1.5] },
  18: { normal: 2.5, fins: [1.5] },
  20: { normal: 2.5, fins: [1.5] },
  24: { normal: 3, fins: [2] },
  30: { normal: 3.5, fins: [2] }
};

// Vis en pouce : [nom, diamètre en pouces, filets/pouce UNC, filets/pouce UNF]
const pouce = [
  ['1/4"', 1 / 4, 20, 28], ['5/16"', 5 / 16, 18, 24], ['3/8"', 3 / 8, 16, 24],
  ['7/16"', 7 / 16, 14, 20], ['1/2"', 1 / 2, 13, 20], ['9/16"', 9 / 16, 12, 18],
  ['5/8"', 5 / 8, 11, 18], ['3/4"', 3 / 4, 10, 16], ['7/8"', 7 / 8, 9, 14],
  ['1"', 1, 8, 12]
];

// Contrainte d'épreuve (MPa) de chaque classe de qualité : c'est la valeur
// utilisée par les tableaux de couples publiés (ISO 898-1 et SAE J429).
// Pour l'inox (ISO 3506), on prend la limite d'élasticité Rp0,2.
const classes = {
  metrique: {
    "4.6": () => 225, "5.8": () => 380, "8.8": () => 580,
    "10.9": () => 830, "12.9": () => 970,
    "A2-70 (inox)": () => 450, "A4-80 (inox)": () => 600
  },
  // La classe 2 est moins résistante au-dessus de 3/4" (19,05 mm)
  pouce: {
    "SAE grade 2": (d) => (d <= 19.05 ? 379 : 228),
    "SAE grade 5": () => 585,
    "SAE grade 8": () => 830
  }
};

// Coefficient pour calculer la section résistante selon le type de filetage
const coefficientFiletage = { metrique: 0.9382, pouce: 0.9743 };

// ---------- Les listes déroulantes ----------

const $ = (id) => document.getElementById(id);
const virgule = (nombre, decimales) => nombre.toFixed(decimales).replace(".", ",");

// Une "option de pas" = { nom affiché, diamètre en mm, pas en mm }
let optionsDePas = [];

function remplirDiametres() {
  const systeme = $("systeme").value;
  $("diametre").innerHTML = "";
  if (systeme === "metrique") {
    Object.keys(metrique).forEach((d) => $("diametre").add(new Option("M" + d, d)));
    $("diametre").value = "8";
  } else {
    pouce.forEach(([nom], i) => $("diametre").add(new Option(nom, i)));
    $("diametre").value = "4"; // 1/2"
  }

  $("classe").innerHTML = "";
  Object.keys(classes[systeme]).forEach((nom) => $("classe").add(new Option(nom, nom)));
  $("classe").value = systeme === "metrique" ? "8.8" : "SAE grade 5";

  remplirPas();
}

function remplirPas() {
  const systeme = $("systeme").value;
  optionsDePas = [];

  if (systeme === "metrique") {
    const d = Number($("diametre").value);
    const { normal, fins } = metrique[d];
    optionsDePas.push({ nom: "Normal (" + virgule(normal, 2).replace(/,?0+$/, "") + " mm)", d, pas: normal });
    fins.forEach((p) =>
      optionsDePas.push({ nom: "Fin (" + virgule(p, 2).replace(/,?0+$/, "") + " mm)", d, pas: p })
    );
  } else {
    const [, pouces, unc, unf] = pouce[Number($("diametre").value)];
    const d = pouces * 25.4;
    optionsDePas.push({ nom: "Normal UNC (" + unc + " filets/pouce)", d, pas: 25.4 / unc });
    optionsDePas.push({ nom: "Fin UNF (" + unf + " filets/pouce)", d, pas: 25.4 / unf });
  }

  $("pas").innerHTML = "";
  optionsDePas.forEach((o, i) => $("pas").add(new Option(o.nom, i)));
}

// ---------- Le calcul ----------

function calculer() {
  const systeme = $("systeme").value;
  const { d, pas } = optionsDePas[Number($("pas").value)]; // mm
  const rp = classes[systeme][$("classe").value](d);       // MPa = N/mm²
  const k = Number($("frottement").value);
  const taux = Number($("charge").value);

  // Section résistante (mm²) : section du "diamètre moyen" du filetage
  const diametreMoyen = d - coefficientFiletage[systeme] * pas;
  const as = (Math.PI / 4) * diametreMoyen ** 2;

  // Force de serrage (N) = taux × contrainte d'épreuve × section
  const force = taux * rp * as;

  // Couple (N·m) = K × d(mm) × F(N) ÷ 1000, puis 1 daN·m = 10 N·m
  const coupleNm = (k * d * force) / 1000;

  $("couple-dan").textContent = virgule(coupleNm / 10, 2);
  $("couple-nm").textContent = virgule(coupleNm, 1);

  // Les vis en pouce se serrent souvent avec une clé en lbf·ft
  $("ligne-lbf").hidden = systeme !== "pouce";
  $("couple-lbf").textContent = virgule(coupleNm * 0.737562, 1);

  $("detail").textContent =
    "Section " + virgule(as, 1) + " mm² · contrainte d'épreuve " + rp +
    " MPa · " + Math.round(taux * 100) + " % · K = " + virgule(k, 2) +
    " · force de serrage " + Math.round(force) + " N";
}

// ---------- Les réactions de la page ----------

$("systeme").addEventListener("change", () => { remplirDiametres(); calculer(); });
$("diametre").addEventListener("change", () => { remplirPas(); calculer(); });
["pas", "classe", "frottement", "charge"].forEach((id) =>
  $(id).addEventListener("change", calculer)
);

remplirDiametres();
calculer();
